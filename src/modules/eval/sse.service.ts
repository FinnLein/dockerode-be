import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private readonly streams = new Map<string, Subject<MessageEvent>>();
  private readonly results = new Map<string, string | Record<string, unknown>>();
  private readonly cleanupTimers = new Map<string, NodeJS.Timeout>();

  register(jobId: string): Observable<MessageEvent> {
    const cachedResult = this.results.get(jobId);
    if (cachedResult !== undefined) {
      this.cleanup(jobId);
      return new Observable<MessageEvent>((subscriber) => {
        subscriber.next({ data: cachedResult });
        subscriber.complete();
      });
    }

    const subject = new Subject<MessageEvent>();
    this.streams.set(jobId, subject);

    return new Observable<MessageEvent>((subscriber) => {
      const sub = subject.subscribe(subscriber);
      return () => {
        sub.unsubscribe();
        this.remove(jobId);
      };
    });
  }

  emit(jobId: string, data: string | Record<string, unknown>): void {
    this.results.set(jobId, data);

    const subject = this.streams.get(jobId);
    if (subject) {
      subject.next({ data });
      subject.complete();
      this.streams.delete(jobId);
    }

    const timer = setTimeout(() => this.cleanup(jobId), 30_000);
    this.cleanupTimers.set(jobId, timer);
  }

  private cleanup(jobId: string): void {
    this.results.delete(jobId);
    this.streams.delete(jobId);

    const timer = this.cleanupTimers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(jobId);
    }
  }

  remove(jobId: string): void {
    const subject = this.streams.get(jobId);
    if (subject) {
      subject.complete();
      this.streams.delete(jobId);
    }
  }
}