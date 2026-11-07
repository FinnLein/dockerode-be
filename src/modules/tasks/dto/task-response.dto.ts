import { ApiProperty } from '@nestjs/swagger';
import { Language } from 'src/generated/prisma/enums';
import { TestCaseDto } from './create.dto';

export class TaskResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'Sum two' })
  title: string;

  @ApiProperty({
    example: { html: '<h2>Описание</h2><p>Текст задачи</p>' },
    description: 'JSON-объект с описанием (html)',
  })
  description: Record<string, unknown>;

  @ApiProperty({ 
    example: ['typescript', 'javascript'], 
    enum: Language, 
    isArray: true 
  })
  language: Language[];

  @ApiProperty({ example: 'function solve() {}' })
  initialCode: string;

  @ApiProperty({ type: () => [TestCaseDto] })
  testCases: TestCaseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}