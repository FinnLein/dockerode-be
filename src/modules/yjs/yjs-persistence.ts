import { RoomsRepository } from '@modules/rooms/rooms.repository';
import { Injectable } from '@nestjs/common';
import { WSSharedDoc } from '@y/websocket-server/utils';
import * as Y from 'yjs';

@Injectable()
export class YjsPersistence {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async bindState(docName: string, ydoc: WSSharedDoc) {
    const room = await this.roomsRepository.findById(docName);

    if (room && room.snapshot) {
      const snapshot = new Uint8Array(room.snapshot);
      Y.applyUpdate(ydoc, snapshot);
    }
  }

  async writeState(docName: string, ydoc: WSSharedDoc) {
    const snapshot = Y.encodeStateAsUpdate(ydoc);
    await this.roomsRepository.update(docName, snapshot);
  }
}
