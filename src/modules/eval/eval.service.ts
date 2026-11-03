import { Injectable } from '@nestjs/common';
import Docker from 'dockerode';
import { buildImageFromTar } from 'src/shared/docker/utils/buildImageFromTar';
import { PassThrough } from 'stream';

interface EvalDto {
  code: string;
}

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

  constructor() {
    this.docker = new Docker();
  }

  async eval(body: EvalDto) {
    const { code } = body;
    const tag = `runner-go:${Date.now()}`;

    const image = await buildImageFromTar(tag, {
      Dockerfile: [
        'FROM golang:1.24-alpine AS builder',
        'WORKDIR /app',
        'COPY main.go .',
        'RUN CGO_ENABLED=0 go build -o /app/main main.go',
        '',
        'FROM alpine:3.20',
        'WORKDIR /app',
        'COPY --from=builder /app/main .',
        'USER nobody',
        'CMD ["/app/main"]',
      ].join('\n'),
      'main.go': code,
    });
    const container = await this.createSandboxContainer(image);

    try {
      const runResult = await this.runWithTimeout(container, 5000);
      const logsResult = await this.collectLogs(container, 1 * 1024 * 1024);

      if (logsResult.outputExceeded) {
        return {
          stdout: '',
          stderr: 'Output limit exceeded',
          statusCode: -1,
          outputExceeded: true,
          timedOut: false,
        };
      }

      if (runResult.timedOut) {
        return {
          stdout: logsResult.stdout,
          stderr: logsResult.stderr,
          statusCode: -1,
          outputExceeded: false,
          timedOut: true,
        };
      }

      return {
        stdout: logsResult.stdout,
        stderr: logsResult.stderr,
        statusCode: runResult.statusCode,
        outputExceeded: false,
        timedOut: false,
      };
    } finally {
      await container.remove({ force: true }).catch(() => undefined);
      await this.docker
        .getImage(image)
        .remove({ force: true })
        .catch(() => undefined);
    }
  }

  private async createSandboxContainer(
    image: string,
  ): Promise<Docker.Container> {
    return this.docker.createContainer({
      Image: image,
      Tty: false,
      HostConfig: {
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

  private async runWithTimeout(
    container: Docker.Container,
    timeoutMs: number,
  ): Promise<RunResult> {
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

  private async collectLogs(
    container: Docker.Container,
    maxOutput: number,
  ): Promise<LogsResult> {
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
      logStream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
      });
    } catch {
      logStream = null;
    }

    if (logStream) {
      this.docker.modem.demuxStream(logStream, stdout, stderr);
      await new Promise<void>((res) => {
        logStream.on('end', res);
        logStream.on('error', res);
      });
    }

    return {
      stdout: Buffer.concat(stdoutChunks).toString('utf8'),
      stderr: Buffer.concat(stderrChunks).toString('utf8'),
      outputExceeded,
    };
  }
}
