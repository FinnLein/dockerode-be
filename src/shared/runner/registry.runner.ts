import { BadRequestException, Injectable } from '@nestjs/common';
import { GoRunner } from './go';
import { NodeRunner } from './node';
import { PythonRunner } from './python';
import { LanguageRunner } from './types';

@Injectable()
export class RegistryRunner {
  private readonly runners = new Map<string, LanguageRunner>();

  constructor(
    private readonly goRunner: GoRunner,
    private readonly nodeRunner: NodeRunner,
    private readonly pythonRunner: PythonRunner
  ) {
    this.register('golang', this.goRunner);
    this.register('go', this.goRunner);
    this.register('node', this.nodeRunner);
    this.register('javascript', this.nodeRunner);
    this.register('js', this.nodeRunner);
    this.register('python', this.pythonRunner)
  }

  get(language: string): LanguageRunner {
    const runner = this.runners.get(language);

    if (!runner) {
      throw new BadRequestException(
        `Unsupported language: '${language}'. Available: ${Array.from(this.runners.keys()).join(', ')}`,
      );
    }

    return runner;
  }

  private register(language: string, runner: LanguageRunner) {
    this.runners.set(language, runner);
  }
}
