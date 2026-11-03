import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  title: string;

  @IsString({ message: 'Язык должен быть строкой' })
  @IsNotEmpty({ message: 'Язык обязателен' })
  language: string;

  @IsString({ message: 'Начальный код должен быть строкой' })
  @IsNotEmpty({ message: 'Начальный код обязателен' })
  initialCode: string;

  @IsArray({ message: 'Тест-кейсы должны быть массивом' })
  @ArrayNotEmpty({ message: 'Добавьте хотя бы один тест-кейс' })
  @IsString({ each: true, message: 'Каждый тест-кейс должен быть строкой' })
  testCases: string[];
}