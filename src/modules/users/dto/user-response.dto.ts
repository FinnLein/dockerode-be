import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({
    example: '75c14669-44dd-4812-b5ea-9e81191cc958',
    description: 'Уникальный идентификатор пользователя (UUID)',
  })
  id: string;

  @ApiPropertyOptional({
    example: 'Смелый енот #412',
    description: 'Имя пользователя или гостя',
    nullable: true,
    type: String,
  })
  name: string | null;

  @ApiPropertyOptional({
    example: 'ekimenko.nikita@list.ru',
    description: 'Электронная почта пользователя',
    nullable: true,
    type: String,
  })
  email: string | null;

  @ApiPropertyOptional({
    example:
      'http://localhost:9000/images/avatars/2969cfc5-877e-4559-9e41-30ce70e59cf6.svg',
    description: 'Публичная ссылка на аватар пользователя',
    nullable: true,
    type: String,
  })
  avatarUrl: string | null;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.user,
    description: 'Роль пользователя',
  })
  role: UserRole;

  @ApiProperty({
    example: '2026-11-06T19:39:53.936Z',
    description: 'Дата и время создания аккаунта',
  })
  createdAt: Date;
}
