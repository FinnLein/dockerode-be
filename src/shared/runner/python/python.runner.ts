import { Injectable } from '@nestjs/common';
import { LanguageRunner } from '../types';
import { pythonTemplate } from './template';

@Injectable()
export class PythonRunner implements LanguageRunner {
	private readonly imageName = 'python:3.15.2-alpine3.24'

	getFileName(): string {
		return 'main.py'
	}

	getImageName(): string {
		return this.imageName
	}

	getDockerfile(): string {
		return `
			FROM ${this.imageName}
			WORKDIR /app
			COPY main.py .
			USER nobody
			CMD ["python", "/app/main.py"]
		`
	}

	wrapCode(code: string, testCases: unknown[]): string {
		const template = pythonTemplate
		const serialized = JSON.stringify(testCases)

		const escaped = serialized.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

		return template
			.replace('__USER_CODE__', code)
			.replace('__TEST_CASES__', `"${escaped}"`)
	}

	parseResult(stdout: string): unknown {
		const marker = '__RESULTS_MARKER__'
		const markerIndex = stdout.lastIndexOf(marker)


		if (markerIndex === -1) {
			return { error: 'No results marker found', stdout };
		}

		const jsonPart = stdout.slice(markerIndex + marker.length).trim();

		try {
			return JSON.parse(jsonPart);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			return {
				error: `Failed to parse results. ${errorMessage}`,
				raw: jsonPart,
			};
		}
	}

}