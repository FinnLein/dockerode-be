interface RunResult {
	statusCode: number;
	timedOut: boolean;
}

interface LogsResult {
	stdout: string;
	stderr: string;
	outputExceeded: boolean;
}

export type { LogsResult, RunResult };

