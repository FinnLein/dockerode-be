import { RabbitMQService } from '@config/rabbitmq/rabbitmq.service';
import { RedisService } from '@config/redis/redis.service';
import { RoomsRepository } from '@modules/rooms/rooms.repository';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { docs } from '@y/websocket-server/utils';
import * as Y from 'yjs';
import { EvalCollabDto } from './dto/eval-collab.dto';
import { EvalCollabResponseDto } from './dto/eval-coolab-response.dto';

@Injectable()
export class EvalCollabService {
  private readonly logger = new Logger(EvalCollabService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly roomsRepository: RoomsRepository,
    private readonly redisService: RedisService,
  ) { }

  async dispatch(dto: EvalCollabDto): Promise<EvalCollabResponseDto> {
    const { roomId, testCases } = dto;

    const token = await this.redisService.acquire(roomId, 180);

    if (!token) {
      this.logger.warn(`Room ${roomId} is already running`);
      throw new ConflictException('Прогон уже выполняется');
    }

    try {
      const room = await this.roomsRepository.findById(roomId);
      if (!room) {
        throw new NotFoundException('Комната не найдена');
      }

      let ydoc: Y.Doc | undefined = docs.get(roomId)

      if (!ydoc) {
        ydoc = new Y.Doc()

        if (room.snapshot) {
          Y.applyUpdate(ydoc, room.snapshot);
        }
      }

      const code = ydoc.getText('code').toString();
      const language = ydoc.getMap('meta').get('language') as string;
      const jobId = crypto.randomUUID();

      this.logger.log(`Received eval collab request: jobId=${jobId}, language=${language}`);

      await this.rabbitMQService.publish('code-eval-collab', {
        jobId,
        code,
        language,
        testCases,
        roomId,
        token,
      });

      return { roomId };
    } catch (error) {
      await this.redisService.release(roomId, token);
      throw error;
    }
  }
}