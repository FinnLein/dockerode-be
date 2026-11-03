import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'Sum two' })
  title: string;

  @ApiProperty({ example: 'typescript' })
  language: string;

  @ApiProperty({ example: 'function solve() {}' })
  initialCode: string;

  @ApiProperty({ example: ['1 + 1 = 2'], type: [String] })
  testCases: string[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}