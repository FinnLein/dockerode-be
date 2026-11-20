import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/generated/prisma/enums';

export class GuestUserDto {
  @ApiProperty({
    example: '75c14669-44dd-4812-b5ea-9e81191cc958',
    description: 'Уникальный идентификатор гостя (UUID)',
  })
  id: string;

  @ApiPropertyOptional({
    example: 'Смелый енот #412',
    description: 'Сгенерированное имя гостя',
    nullable: true,
    type: String,
  })
  name: string | null;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.guest,
    description: 'Роль пользователя',
  })
  role: UserRole;
}

export class GuestAuthResponseDto {
  @ApiProperty({
    type: GuestUserDto,
    description: 'Данные созданного гостевого аккаунта',
  })
  user: GuestUserDto;

  @ApiProperty({
    example: 'Гостевой вход выполнен',
    description: 'Сообщение о результате операции',
  })
  message: string;
}
