import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, ReplaySubject } from 'rxjs';
import { EvalStreamEvent } from './types/stream.types';

@Injectable()
export class SseService {
  private readonly BUFFER = 5;

  private readonly subjects = new Map<string, ReplaySubject<MessageEvent>>();
  private readonly clearTimeouts = new Map<string, NodeJS.Timeout>();

  subscribe(id: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      let subject = this.subjects.get(id);

      if (!subject) {
        subject = new ReplaySubject<MessageEvent>(this.BUFFER);
        this.subjects.set(id, subject);
      }

      const sub = subject.subscribe(subscriber);

      return () => {
        sub.unsubscribe();
        if (!subject.observed && this.subjects.get(id) === subject) {
          this.subjects.delete(id);
          const t = this.clearTimeouts.get(id);
          if (t) {
            clearTimeout(t);
            this.clearTimeouts.delete(id);
          }
        }
      };
    });
  }

  publish(id: string, event: { data: EvalStreamEvent }): void {
    let subject = this.subjects.get(id);

    if (!subject) {
      subject = new ReplaySubject<MessageEvent>(this.BUFFER);
      this.subjects.set(id, subject);
    }

    subject.next(event);

    const isFinished = event.data.type === 'run_finished';
    const isFailed = event.data.type === 'run_failed';

    if (isFinished || isFailed) {
      subject.complete();

      const existing = this.clearTimeouts.get(id);
      if (existing) clearTimeout(existing);

      const timeoutId = setTimeout(() => {
        if (this.subjects.get(id) === subject) {
          this.subjects.delete(id);
        }
        this.clearTimeouts.delete(id);
      }, 30_000);

      this.clearTimeouts.set(id, timeoutId);
    }
  }
}