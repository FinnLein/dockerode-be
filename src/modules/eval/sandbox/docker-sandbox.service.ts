import { Injectable, Logger } from '@nestjs/common';
import Docker from 'dockerode';
import { buildImageFromTar } from 'src/shared/docker/utils/buildImageFromTar';
import { PassThrough } from 'stream';
import {
  SANDBOX_MAX_OUTPUT_BYTES,
  SANDBOX_TIMEOUT_MS,
} from './docker-sandbox.const';
import { LogsResult, RunResult } from './docker-sandbox.types';

@Injectable()
export class DockerSandboxService {
  private readonly logger = new Logger(DockerSandboxService.name);
  private readonly docker: Docker;

  constructor() {
    this.docker = new Docker();
  }

  async buildImage(
    tag: string,
    files: Record<string, string>,
  ): Promise<{ success: boolean; logs?: string[]; error?: string }> {
    const buildResult = await buildImageFromTar(tag, files);
    return {
      success: buildResult.success,
      logs: buildResult.logs,
      error: buildResult.error,
    };
  }

  async createSandboxContainer(image: string): Promise<Docker.Container> {
    return this.docker.createContainer({
      Image: image,
      Tty: false,
      HostConfig: {
        AutoRemove: false,
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

  async runWithTimeout(
    container: Docker.Container,
    timeoutMs: number = SANDBOX_TIMEOUT_MS,
  ): Promise<RunResult> {
    await container.start();

    let timedOut = false;

    const waitPromise = container.wait() as Promise<{ StatusCode: number }>;
    const timeoutPromise = new Promise<never>((_, rej) => {
      setTimeout(() => {
        timedOut = true;
        void container.kill().catch(() => undefined);
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

  async collectLogs(
    container: Docker.Container,
    maxOutput: number = SANDBOX_MAX_OUTPUT_BYTES,
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
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(`container.logs failed: ${errorMessage}`);
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

  async cleanup(
    container: Docker.Container | null,
    image: string | null,
  ): Promise<void> {
    if (container) {
      await container.remove({ force: true }).catch(() => undefined);
    }
    if (image) {
      await this.docker
        .getImage(image)
        .remove({ force: true })
        .catch(() => undefined);
    }
    await this.docker
      .pruneImages({ filters: { dangling: ['true'], until: ['10m'] } })
      .catch(() => undefined);
  }
}
