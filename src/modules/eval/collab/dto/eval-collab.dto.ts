import { TestCaseDto } from '@modules/tasks/dto/create.dto';
import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

export class EvalCollabDto {
  @IsUUID()
  roomId: string;

  @IsArray({ message: 'Тест-кейсы должны быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];
}
