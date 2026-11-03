import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, ChannelModel, connect } from 'amqplib';


@Injectable()
export class RabbitMQService implements OnModuleDestroy, OnModuleInit {
	private readonly logger = new Logger(RabbitMQService.name)

	private connection: ChannelModel | null = null
	private channel: Channel | null = null

	async onModuleInit() {
		await this.connect();
	}

	async onModuleDestroy() {
		await this.channel?.close().catch(() => undefined)
		await this.connection?.close().catch(() => undefined)
	}

	async publish(queue: string, message: Record<string, unknown>) {
		if (!this.channel) {
			throw new Error('RabbitMQ channel is not initialized');
		}

		await this.channel?.assertQueue(queue, { durable: true })

		const buffer = Buffer.from(JSON.stringify(message))

		this.channel?.sendToQueue(queue, buffer, {
			persistent: true
		})
	}

	async consume(queue: string, handler: (msg: unknown) => Promise<void>) {
		if (!this.channel) {
			throw new Error('RabbitMQ channel is not initialized');
		}

		await this.channel?.assertQueue(queue, { durable: true })

		await this.channel.prefetch(1)

		await this.channel.consume(queue, async (rawMsg) => {
			if (rawMsg === null) return

			try {
				const content: unknown = JSON.parse(rawMsg.content.toString())

				await handler(content)

				this.channel?.ack(rawMsg)

			} catch (error) {
				const msg = error instanceof Error ? error.message : String(error);
				this.logger.error(`Message processing failed: ${msg}`);


				this.channel?.nack(rawMsg, false, false)
			}
		})

	}

	private async connect() {
		const url = process.env.RABBITMQ_URL || 'amqp://user:pass@localhost:5672'

		try {
			this.connection = await connect(url)
			this.channel = await this.connection.createChannel()
			this.logger.log(`Connected to RabbitMQ at ${url}`);

			this.connection.on('close', () => {
				this.logger.warn('RabbitMQ connection closed. Reconnecting in 5s...');

				setTimeout(() => this.connect(), 5000)
			})

			this.connection.on('error', (err) => {
				this.logger.error(`RabbitMQ connection error: ${err.message}`);
			})

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)

			this.logger.error(`Failed to connect to RabbitMQ: ${errorMessage}`);

			setTimeout(() => this.connect(), 5000)
		}
	}

}
