import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from 'src/config/rabbitmq/rabbitmq.service';
import { EvalService } from 'src/modules/eval/eval.service';
import { SseService } from './sse.service';

@Injectable()
export class EvalWorker implements OnModuleInit {
	private readonly logger = new Logger(EvalWorker.name)

	constructor(
		private readonly evalService: EvalService,
		private readonly rabbitMQService: RabbitMQService,
		private readonly sseService: SseService
	) { }

	async onModuleInit() {
		await this.rabbitMQService.consume('code-eval', async (msg) => {
			const { jobId, code } = msg as { jobId: string; code: string };

			this.logger.log(`Processing job ${jobId}`);


			try {
				const result = await this.evalService.eval({ code });

				this.logger.log(`Job ${jobId} finished: ${JSON.stringify(result)}`);

				this.sseService.emit(jobId, result)
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				this.logger.error(`Job ${jobId} failed: ${message}`);
				this.sseService.emit(jobId, { error: message });
				throw error;
			}
		})
	}
}