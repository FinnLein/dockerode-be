import { RoomsModule } from '@modules/rooms/rooms.module';
import { Global, Module } from '@nestjs/common';
import { HocuspocusService } from './hocuspocus.service';

@Global()
@Module({
  imports: [RoomsModule],
  providers: [HocuspocusService],
})
export class HocuspocusModule {}
