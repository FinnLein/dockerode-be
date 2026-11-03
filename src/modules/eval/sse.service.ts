import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  register(jobId: string) {
    const subject = new Subject<MessageEvent>();

    this.streams.set(jobId, subject);

    return subject;
  }

  remove(jobId) {
    const subject = this.streams.get(jobId);

    if (subject) {
      subject.complete();
      this.streams.delete(jobId);
    }
  }

  emit(jobId: string, data: string | Record<string, unknown>) {
    const subject = this.streams.get(jobId);

    if (subject) {
      subject.next({ data });
      subject.complete();
      this.streams.delete(jobId);
    }
  }
}
