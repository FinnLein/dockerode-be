import { BadRequestException, Injectable } from '@nestjs/common';
import { GoRunner } from './go/go.runner';
import { LanguageRunner } from './types';

@Injectable()
export class RegistryRunner {
	private readonly runners = new Map<string, LanguageRunner>()

	constructor(
		private readonly goRunner: GoRunner,
	) {
		this.register('go', this.goRunner)
	}

	get(language: string): LanguageRunner {
		const runner = this.runners.get(language);

		if (!runner) {
			throw new BadRequestException(
				`Unsupported language: '${language}'. Available: ${Array.from(this.runners.keys()).join(', ')}`
			);
		}

		return runner;
	}

	private register(language: string, runner: LanguageRunner) {
		this.runners.set(language, runner)
	}
}