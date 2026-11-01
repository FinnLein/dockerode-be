import { Injectable } from '@nestjs/common';
import { RegistryRunner } from '@shared/runner/registry.runner';
import Docker from 'dockerode';
import { buildImageFromTar } from 'src/shared/docker/utils/buildImageFromTar';
import { PassThrough } from 'stream';
import { EvalDto } from './dto/eval.dto';

interface RunResult {
	statusCode: number;
	timedOut: boolean;
}

interface LogsResult {
	stdout: string;
	stderr: string;
	outputExceeded: boolean;
}

@Injectable()
export class EvalService {
	private readonly docker: Docker;

	constructor(
		private readonly registryRunner: RegistryRunner
	) {
		this.docker = new Docker();
	}

	async eval(body: EvalDto) {
		const { code, language, testCases = [] } = body;

		const runner = this.registryRunner.get(language);
		const tag = `runner-${language}:${Date.now()}`;
		const wrappedCode = runner.wrapCode(code, testCases);

		const buildResult = await buildImageFromTar(tag, {
			Dockerfile: runner.getDockerfile(),
			[runner.getFileName()]: wrappedCode,
		});

		if (!buildResult.success) {
			return {
				stdout: null,
				stderr: buildResult.logs?.join('') || buildResult.error || 'Build failed',
				statusCode: -1,
				outputExceeded: false,
				timedOut: false,
			};
		}

		const container = await this.createSandboxContainer(tag);

		try {
			const runResult = await this.runWithTimeout(container, 5000);
			const logsResult = await this.collectLogs(container, 1 * 1024 * 1024);

			const parsedResult = runner.parseResult(logsResult.stdout);

			if (logsResult.outputExceeded) {
				return {
					stdout: null,
					stderr: 'Output limit exceeded',
					statusCode: -1,
					outputExceeded: true,
					timedOut: false,
				};
			}

			if (runResult.timedOut) {
				return {
					stdout: parsedResult,
					stderr: logsResult.stderr,
					statusCode: -1,
					outputExceeded: false,
					timedOut: true,
				};
			}

			return {
				stdout: parsedResult,
				stderr: logsResult.stderr,
				statusCode: runResult.statusCode,
				outputExceeded: false,
				timedOut: false,
			};
		} finally {
			await container.remove({ force: true }).catch(() => undefined);
			await this.docker.getImage(tag).remove({ force: true }).catch(() => undefined);
		}
	}

	private async createSandboxContainer(image: string): Promise<Docker.Container> {

		return this.docker.createContainer({
			Image: image,
			Tty: false,
			HostConfig: {
				AutoRemove: true,
				CapDrop: ['ALL'],
				SecurityOpt: ['no-new-privileges'],
				Memory: 128 * 1024 * 1024,
				NanoCpus: 200_000_000,
				PidsLimit: 50,
				NetworkMode: 'none',
				ReadonlyRootfs: true,
				Tmpfs: {
					'/tmp': 'rw,noexec,nosuid,size=64m',
				},
			},
		});
	}

	private async runWithTimeout(container: Docker.Container, timeoutMs: number): Promise<RunResult> {
		await container.start();

		let timedOut = false;

		const waitPromise = container.wait();
		const timeoutPromise = new Promise<never>((_, rej) => {
			setTimeout(async () => {
				timedOut = true;
				await container.kill().catch(() => undefined);
				rej(new Error('Execution timeout'));
			}, timeoutMs);
		});

		try {
			const waitResult = await Promise.race([waitPromise, timeoutPromise]);
			return { statusCode: waitResult.StatusCode, timedOut: false };
		} catch (error) {
			if (timedOut) return { statusCode: -1, timedOut: true };
			throw error;
		}
	}

	private async collectLogs(container: Docker.Container, maxOutput: number): Promise<LogsResult> {
		const stdout = new PassThrough();
		const stderr = new PassThrough();

		const stdoutChunks: Buffer[] = [];
		const stderrChunks: Buffer[] = [];

		let outputExceeded = false;
		let totalBytes = 0;

		const onChunk = (chunk: Buffer, target: Buffer[]) => {
			if (outputExceeded) return;

			totalBytes += chunk.length;
			target.push(chunk);

			if (totalBytes > maxOutput) {
				outputExceeded = true;
				container.kill().catch(() => undefined);
			}
		};

		stdout.on('data', (chunk: Buffer) => onChunk(chunk, stdoutChunks));
		stderr.on('data', (chunk: Buffer) => onChunk(chunk, stderrChunks));

		let logStream: NodeJS.ReadableStream | null = null;
		try {
			logStream = await container.logs({ stdout: true, stderr: true, follow: true });
		} catch {
			logStream = null;
		}

		if (logStream) {
			this.docker.modem.demuxStream(logStream, stdout, stderr);
			await new Promise<void>((res) => {
				logStream!.on('end', res);
				logStream!.on('error', res);
			});
		}

		return {
			stdout: Buffer.concat(stdoutChunks).toString('utf8'),
			stderr: Buffer.concat(stderrChunks).toString('utf8'),
			outputExceeded,
		};
	}
}