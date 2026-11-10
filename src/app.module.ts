import { YjsModule } from '@modules/yjs/yjs.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './config/prisma/prisma.module';
import { RabbitMQModule } from './config/rabbitmq/rabbitmq.module';
import { AuthModule } from './modules/auth/auth.module';
import { EvalModule } from './modules/eval/eval.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    PrismaModule,
    EvalModule,
    RabbitMQModule,
    UsersModule,
    AuthModule,
    TasksModule,
    YjsModule
  ],
  controllers: [AppController],
})
export class AppModule {}
