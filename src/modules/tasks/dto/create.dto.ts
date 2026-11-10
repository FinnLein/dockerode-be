import type { JsonValue } from '@shared/types/types';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Language } from 'src/generated/prisma/enums';

export class TestCaseDto {
  @IsString({ message: 'Input должен быть строкой' })
  @IsNotEmpty({ message: 'Input обязателен' })
  input: string;

  @IsString({ message: 'Expected должен быть строкой' })
  @IsNotEmpty({ message: 'Expected обязателен' })
  expected: string;
}

export class InitialCodeDto {
  @IsEnum(Language, { message: 'Недопустимый язык программирования' })
  @IsNotEmpty({ message: 'Язык обязателен' })
  language: Language;

  @IsString({ message: 'Шаблон кода должен быть строкой' })
  @IsNotEmpty({ message: 'Шаблон кода обязателен' })
  template: string;
}

export class CreateTaskDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  title: string;

  @IsObject({ message: 'Описание должно быть объектом' })
  @IsNotEmpty({ message: 'Описание обязательно' })
  description: JsonValue;

  @IsArray({ message: 'Язык должен быть массивом' })
  @ArrayNotEmpty({ message: 'Укажите хотя бы один язык' })
  @IsEnum(Language, { each: true, message: 'Недопустимый язык программирования' })
  language: Language[];

  @IsArray({ message: 'Начальные коды должны быть массивом' })
  @ArrayNotEmpty({ message: 'Добавьте хотя бы один начальный код' })
  @ValidateNested({ each: true })
  @Type(() => InitialCodeDto)
  initialCode: InitialCodeDto[];

  @IsArray({ message: 'Тест-кейсы должны быть массивом' })
  @ArrayNotEmpty({ message: 'Добавьте хотя бы один тест-кейс' })
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];
}