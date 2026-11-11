import { Injectable } from '@nestjs/common';
import * as Y from 'yjs';
import { CreateRoomDto } from './dto/create.dto';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  create(userId: string, data: CreateRoomDto) {
    const ydoc = new Y.Doc();
    ydoc.getText('code').insert(0, data?.initialCode ?? '');

    const snapshot = Y.encodeStateAsUpdate(ydoc);
    ydoc.destroy();

    return this.roomsRepository.create({
      task: { connect: { id: data.taskId } },
      owner: { connect: { id: userId } },
      snapshot: Buffer.from(snapshot),
    });
  }
}
