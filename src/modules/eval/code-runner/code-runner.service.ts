import { Injectable } from '@nestjs/common';
import { RegistryRunner } from '@shared/runner/registry.runner';
import { EvalDto } from '../dto/eval.dto';
import { DockerSandboxService } from '../sandbox/docker-sandbox.service';
import { ParsedResult, TestResult } from '../types/eval.types';

@Injectable()
export class CodeRunnerService {
  constructor(
    private readonly registryRunner: RegistryRunner,
    private readonly sandbox: DockerSandboxService,
  ) {}

  async eval(body: EvalDto): Promise<TestResult> {
    const { code, language, testCases = [] } = body;

    const runner = this.registryRunner.get(language);
    const tag = `runner-${language}:${Date.now()}`;
    const wrappedCode = runner.wrapCode(code, testCases);

    const buildResult = await this.sandbox.buildImage(tag, {
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

    let container: Awaited<
      ReturnType<DockerSandboxService['createSandboxContainer']>
    > | null = null;

    try {
      container = await this.sandbox.createSandboxContainer(tag);

      const runResult = await this.sandbox.runWithTimeout(container);
      const logsResult = await this.sandbox.collectLogs(container);

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
      await this.sandbox.cleanup(container, tag);
    }
  }
}
