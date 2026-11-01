import { TestCase } from '../eval.types';

export class CheckSupportTaskDto {
  name: string;
  language: string; 
  code: string;
  testCases: TestCase[]
}

export class CheckSupportDto {
  tasks: CheckSupportTaskDto[];
}