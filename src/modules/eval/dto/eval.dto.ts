import { TestCaseDto } from '@modules/tasks/dto/create.dto';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';


export class EvalDto {
	@IsString({ message: 'Язык должен быть строкой' })
	@IsNotEmpty({ message: 'Язык обязателен' })
	language: string;

	@IsString({ message: 'Код должен быть строкой' })
	@IsNotEmpty({ message: 'Код обязателен' })
	code: string;

	@IsArray({ message: 'Тест-кейсы должны быть массивом' })
	@ValidateNested({ each: true })
	@Type(() => TestCaseDto)
	testCases: TestCaseDto[];
}