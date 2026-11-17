import { TestResult } from './eval.types';

interface EvalStreamEvent {
	type: 'run_started' | 'run_finished' | 'run_failed';
	jobId?: string;
	result?: TestResult;
	error?: string;
}

export type { EvalStreamEvent };

