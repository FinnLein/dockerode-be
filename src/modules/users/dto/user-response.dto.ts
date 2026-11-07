import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: '75c14669-44dd-4812-b5ea-9e81191cc958',
    description: 'Уникальный идентификатор пользователя (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'ekimenko.nikita@list.ru',
    description: 'Электронная почта пользователя',
  })
  email: string;

  @ApiProperty({
    example: '2026-11-06T19:39:53.936Z',
    description: 'Дата и время создания аккаунта',
  })
  createdAt: Date;
}
