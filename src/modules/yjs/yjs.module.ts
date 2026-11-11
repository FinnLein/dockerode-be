import { RoomsModule } from '@modules/rooms/rooms.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { setPersistence, WSSharedDoc } from '@y/websocket-server/utils';
import { YjsPersistence } from './yjs-persistence';
import { YjsGateway } from './yjs.gateway';

@Module({
  imports: [RoomsModule],
  providers: [YjsGateway, YjsPersistence],
})
export class YjsModule implements OnModuleInit {
  constructor(private readonly yjsPersistence: YjsPersistence) {}

  onModuleInit() {
    setPersistence({
      bindState: (docName: string, ydoc: WSSharedDoc) => {
        void this.yjsPersistence.bindState(docName, ydoc);
      },
      writeState: (docName: string, ydoc: WSSharedDoc) => {
        return this.yjsPersistence.writeState(docName, ydoc);
      },
      provider: null,
    });
  }
}
