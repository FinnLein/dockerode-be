import { RedisModule } from '@config/redis/redis.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './config/prisma/prisma.module';
import { RabbitMQModule } from './config/rabbitmq/rabbitmq.module';
import { S3Module } from './config/s3/s3.module';
import { AuthModule } from './modules/auth/auth.module';
import { EvalModule } from './modules/eval/eval.module';
import { HocuspocusModule } from './modules/hocuspocus/hocuspocus.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    PrismaModule,
    RedisModule,
    EvalModule,
    RabbitMQModule,
    UsersModule,
    AuthModule,
    TasksModule,
    RoomsModule,
    HocuspocusModule,
    S3Module,
  ],
  controllers: [AppController],
})
export class AppModule {}
