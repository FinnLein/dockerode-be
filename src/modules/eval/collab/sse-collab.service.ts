import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, ReplaySubject } from 'rxjs';
import { EvalStreamEvent } from '../types/stream.types';

@Injectable()
export class SseCollabService {
  private readonly BUFFER = 1;
  private readonly subjects = new Map<string, ReplaySubject<MessageEvent>>();
  private readonly cleanups = new Map<string, NodeJS.Timeout>();

  subscribe(roomId: string): Observable<MessageEvent> {
    let subject = this.subjects.get(roomId);

    if (!subject) {
      subject = new ReplaySubject<MessageEvent>(this.BUFFER);
      this.subjects.set(roomId, subject);
    }

    const timer = this.cleanups.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.cleanups.delete(roomId);
    }

    return new Observable<MessageEvent>((subscriber) => {
      const inner = subject.subscribe(subscriber);

      return () => {
        inner.unsubscribe();

        if (!subject.observed) {
          const t = setTimeout(() => {
            if (!subject.observed) {
              this.subjects.delete(roomId);
              this.cleanups.delete(roomId);
            }
          }, 30_000);

          this.cleanups.set(roomId, t);
        }
      };
    });
  }

  publish(roomId: string, event: { data: EvalStreamEvent }) {
    let subject = this.subjects.get(roomId);
    if (!subject) {
      subject = new ReplaySubject<MessageEvent>(this.BUFFER);
      this.subjects.set(roomId, subject);
    }
    subject.next(event);
  }
}
