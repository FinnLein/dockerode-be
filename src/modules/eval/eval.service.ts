import { Injectable, Logger } from '@nestjs/common';
import { RegistryRunner } from '@shared/runner/registry.runner';
import Docker from 'dockerode';
import { buildImageFromTar } from 'src/shared/docker/utils/buildImageFromTar';
import { PassThrough } from 'stream';
import { CheckSupportDto } from './dto/check-support.dto';
import { EvalDto } from './dto/eval.dto';
import { LogsResult, ParsedResult, RunResult, TestResult } from './eval.types';

@Injectable()
export class EvalService {
  private readonly logger = new Logger(EvalService.name);
  private readonly docker: Docker;

  constructor(private readonly registryRunner: RegistryRunner) {
    this.docker = new Docker();
  }

  async checkSupport(dto: CheckSupportDto) {
    this.logger.log(`Check-support: starting ${dto.tasks.length} tasks`);

    const results = await Promise.allSettled(
      dto.tasks.map(async (task) => {
        const { name, language, testCases, code } = task;
        const start = Date.now();

        this.logger.debug(`[START] ${name} (${language})`);

        try {
          const result = await this.eval({ language, code, testCases });
          const duration = Date.now() - start;

          this.logger.log(
            `[DONE] ${name} | ${result.success ? 'OK' : 'FAIL'} | ${duration}ms | passed=${result.passed}/${result.total}`,
          );

          if (result.stderr) {
            this.logger.warn(
              `[STDERR] ${name}: ${result.stderr.slice(0, 200)}...`,
            );
          }

          return result;
        } catch (error) {
          const duration = Date.now() - start;
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(`[FAILED] ${name} | ${duration}ms | ${message}`);
          throw error;
        }
      }),
    );

    this.logger.log(`Check-support: finished`);

    return dto.tasks.map((task, index) => {
      const res = results[index];
      if (res.status === 'fulfilled') {
        return { name: task.name, status: 'fulfilled', result: res.value };
      }
      const message =
        res.reason instanceof Error ? res.reason.message : String(res.reason);
      return { name: task.name, status: 'rejected', error: message };
    });
  }

  async eval(body: EvalDto): Promise<TestResult> {
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
        success: false,
        passed: 0,
        failed: testCases.length,
        total: testCases.length,
        results: [],
        stderr:
          buildResult.logs?.join('') || buildResult.error || 'Build failed',
        statusCode: -1,
        outputExceeded: false,
        timedOut: false,
      };
    }

    const container = await this.createSandboxContainer(tag);

    try {
      const runResult = await this.runWithTimeout(container, 5000);
      const logsResult = await this.collectLogs(container, 1 * 1024 * 1024);

      if (logsResult.outputExceeded) {
        return {
          success: false,
          passed: 0,
          failed: testCases.length,
          total: testCases.length,
          results: [],
          stderr: 'Output limit exceeded',
          statusCode: -1,
          outputExceeded: true,
          timedOut: false,
        };
      }

      if (runResult.timedOut) {
        return {
          success: false,
          passed: 0,
          failed: testCases.length,
          total: testCases.length,
          results: [],
          stderr: logsResult.stderr,
          statusCode: -1,
          outputExceeded: false,
          timedOut: true,
        };
      }

      const parsedResult = runner.parseResult(logsResult.stdout);
      const actualResult: ParsedResult[] = Array.isArray(parsedResult)
        ? (parsedResult as ParsedResult[])
        : [];

      const results = testCases.map((tc, index) => {
        const actual = actualResult.find((r) => r.index === index);
        const actualValue = actual?.actual ?? '';
        const isPassed = actualValue === tc.expected && !actual?.error;

        return {
          index,
          passed: isPassed,
          actual: actualValue,
          expected: tc.expected,
          error: actual?.error,
        };
      });

      const passed = results.filter((r) => r.passed).length;

      return {
        success: passed === testCases.length,
        passed,
        failed: testCases.length - passed,
        total: testCases.length,
        results,
        stderr: logsResult.stderr,
        statusCode: runResult.statusCode,
        outputExceeded: false,
        timedOut: false,
      };
    } finally {
      await container.remove({ force: true })
        .catch(() => undefined);
      await this.docker
        .getImage(tag)
        .remove({ force: true })
        .catch(() => undefined);
      await this.docker
        .pruneImages({ filters: { dangling: ['true'], until: ['10m'] } })
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

  private async runWithTimeout(
    container: Docker.Container,
    timeoutMs: number,
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
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
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
}
