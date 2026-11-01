interface TestCase {
  input: string;
  expected: string;
}

interface TestCaseResult {
  index: number;
  passed: boolean;
  actual: string;
  expected: string;
  error?: string;
}

interface RunResult {
  statusCode: number;
  timedOut: boolean;
}

interface LogsResult {
  stdout: string;
  stderr: string;
  outputExceeded: boolean;
}

interface TestResult {
  success: boolean;
  passed: number;
  failed: number;
  total: number;
  results: TestCaseResult[]; 
  stderr: string;
  statusCode: number;
  outputExceeded: boolean;
  timedOut: boolean;
}

interface ParsedResult {
  index: number;
  actual: string;
  error?: string;
}

export type { LogsResult, ParsedResult, RunResult, TestCase, TestCaseResult, TestResult };

