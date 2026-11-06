import { JsonValue } from '@shared/types/types';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TestCaseDto {
  @IsString({ message: 'Input должен быть строкой' })
  @IsNotEmpty({ message: 'Input обязателен' })
  input: string;

  @IsString({ message: 'Expected должен быть строкой' })
  @IsNotEmpty({ message: 'Expected обязателен' })
  expected: string;
}

export class CreateTaskDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  title: string;

  @IsObject({ message: 'Описание должно быть объектом' })
  @IsNotEmpty({ message: 'Описание обязательно' })
  description: JsonValue;

  @IsString({ message: 'Язык должен быть строкой' })
  @IsNotEmpty({ message: 'Язык обязателен' })
  language: string;

  @IsString({ message: 'Начальный код должен быть строкой' })
  @IsNotEmpty({ message: 'Начальный код обязателен' })
  initialCode: string;

  @IsArray({ message: 'Тест-кейсы должны быть массивом' })
  @ArrayNotEmpty({ message: 'Добавьте хотя бы один тест-кейс' })
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];
}
