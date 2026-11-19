import { RedisModule } from '@config/redis/redis.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './config/prisma/prisma.module';
import { RabbitMQModule } from './config/rabbitmq/rabbitmq.module';
import { AuthModule } from './modules/auth/auth.module';
import { EvalModule } from './modules/eval/eval.module';
import { HocuspocusModule } from './modules/hocuspocus/hocuspocus.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    EvalModule,
    RabbitMQModule,
    UsersModule,
    AuthModule,
    TasksModule,
    RoomsModule,
    HocuspocusModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
