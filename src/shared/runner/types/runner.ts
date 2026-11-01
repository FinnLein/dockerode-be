interface LanguageRunner {
	getDockerfile(): string
	getFileName(): string
	wrapCode(code: string, testCases: unknown[]): string
	parseResult(stdout: string): unknown
	getImageName(): string
}

export type { LanguageRunner }

