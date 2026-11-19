import { Database } from '@hocuspocus/extension-database';
import { Hocuspocus, type WebSocketLike } from '@hocuspocus/server';
import { RoomsRepository } from '@modules/rooms/rooms.repository';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Peer } from 'crossws';
import crossws from 'crossws/adapters/node';
import type { Server as HttpServer } from 'node:http';

type HocuspocusConnection = ReturnType<Hocuspocus['handleConnection']>;

@Injectable()
export class HocuspocusService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(HocuspocusService.name);
  private readonly hocuspocus: Hocuspocus;
  private readonly connections = new WeakMap<Peer, HocuspocusConnection>();

  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.hocuspocus = new Hocuspocus({
      debounce: 500,
      quiet: true,
      extensions: [
        new Database({
          fetch: async ({ documentName }) => {
            const room = await this.roomsRepository.findById(documentName);
            return room?.snapshot ? new Uint8Array(room.snapshot) : null;
          },
          store: async ({ documentName, state }) => {
            await this.roomsRepository.saveSnapshot(documentName, state);
          },
        }),
      ],
    });
  }

  onModuleInit() {
    const httpServer =
      this.httpAdapterHost.httpAdapter.getHttpServer() as HttpServer;

    const ws = crossws({
      hooks: {
        open: (peer) => {
          const connection = this.hocuspocus.handleConnection(
            peer.websocket as unknown as WebSocketLike,
            peer.request,
          );
          this.connections.set(peer, connection);
        },
        message: (peer, message) => {
          this.connections.get(peer)?.handleMessage(message.uint8Array());
        },
        close: (peer, event) => {
          this.connections.get(peer)?.handleClose({
            code: event.code ?? 1000,
            reason: event.reason ?? '',
          });
          this.connections.delete(peer);
        },
      },
    });

    httpServer.on('upgrade', (request, socket, head) => {
      if (request.url?.startsWith('/collab')) {
        ws.handleUpgrade(request, socket, head);
      }
    });

    this.logger.log('Hocuspocus attached to main HTTP server on /collab');
  }

  onModuleDestroy() {
    this.hocuspocus.closeConnections();
  }
}
