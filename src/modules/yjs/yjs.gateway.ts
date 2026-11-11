import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { setupWSConnection } from '@y/websocket-server/utils';
import { Request } from 'express';
import { WebSocket } from 'ws';

@WebSocketGateway()
export class YjsGateway implements OnGatewayConnection {
	handleConnection(connection: WebSocket, request: Request) {
		const requestUrl = new URL(request.url!, `http://${request.headers.host}`);
		const roomId = requestUrl.searchParams.get('roomId') || '';

		setupWSConnection(connection, request, { ...(roomId && { docName: roomId }) })
	}
}