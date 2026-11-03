import { Injectable } from '@nestjs/common';
import { LanguageRunner } from '../types';
import { goTemplate } from './template';

@Injectable()
export class GoRunner implements LanguageRunner {
	private readonly imageName = 'golang:1.24-alpine'

	getDockerfile(): string {
		return `
			FROM ${this.imageName} AS builder
			WORKDIR /app
			COPY main.go .
			RUN GO111MODULE=off CGO_ENABLED=0 go build -o /app/main

			FROM alpine:3.20
			WORKDIR /app
			COPY --from=builder /app/main .
			USER nobody
			CMD ["/app/main"]	
			`
	}

	getFileName(): string {
		return 'main.go'
	}

	getImageName(): string {
		return this.imageName
	}

	wrapCode(code: string, testCases: unknown[]): string {
		const template = goTemplate
		const serialized = JSON.stringify(testCases)

		return template
			.replace('__USER_CODE__', code)
			.replace('__TEST_CASES__', serialized)
	}

	parseResult(stdout: string): unknown {
		const marker = '__RESULTS_MARKER__'
		const markerIndex = stdout.lastIndexOf(marker)

		if (markerIndex === -1) {
			return { error: 'No results marker found', stdout };
		}

		const jsonPart = stdout.slice(markerIndex + marker.length).trim()

		try {
			return JSON.parse(jsonPart);
		} catch (error) {
			return { error: 'Failed to parse results', raw: jsonPart };
		}
	}
}