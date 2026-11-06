import { ApiProperty } from '@nestjs/swagger';
import { TestCaseDto } from './create.dto';

export class TaskResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'Sum two' })
  title: string;

  @ApiProperty({
    example: { markdown: '## Описание\nТекст задачи' },
    description: 'JSON-объект с описанием (markdown)',
  })
  description: Record<string, unknown>;

  @ApiProperty({ example: 'typescript' })
  language: string;

  @ApiProperty({ example: 'function solve() {}' })
  initialCode: string;

  @ApiProperty({ type: () => [TestCaseDto] })
  testCases: TestCaseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
