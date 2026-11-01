export class CheckSupportTaskDto {
  name: string;
  code: string;
  testCases: Array<{ input: string }>;
}

export class CheckSupportDto {
  tasks: CheckSupportTaskDto[];
}