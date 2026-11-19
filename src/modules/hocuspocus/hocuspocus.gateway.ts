import { WebSocketGateway } from '@nestjs/websockets';
import { HocuspocusService } from './hocuspocus.service';

@WebSocketGateway()
export class HocuspocusGateway {
  constructor(private readonly hocuspocusService: HocuspocusService) {}
}
