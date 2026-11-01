import { TestCase } from '../eval.types';

export class EvalDto {
	language: string;
	code: string;
	testCases: TestCase[]
}