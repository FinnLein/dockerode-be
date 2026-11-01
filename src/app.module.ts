import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from './config/rabbitmq/rabbitmq.module';
import { EvalModule } from './modules/eval/eval.module';

@Module({
  imports: [EvalModule, RabbitMQModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
