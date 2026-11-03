import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './config/prisma/prisma.module';
import { RabbitMQModule } from './config/rabbitmq/rabbitmq.module';
import { AuthModule } from './modules/auth/auth.module';
import { EvalModule } from './modules/eval/eval.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [PrismaModule, EvalModule, RabbitMQModule, UsersModule, AuthModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
