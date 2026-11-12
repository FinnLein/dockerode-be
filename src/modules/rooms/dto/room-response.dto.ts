import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({
    example: 'b92f2d0d-fb3b-4765-8298-263a05ffcdad',
    description: 'Уникальный идентификатор комнаты (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'Идентификатор задачи, к которой привязана комната',
  })
  taskId: string;

  @ApiProperty({
    example: '75c14669-44dd-4812-b5ea-9e81191cc958',
    description: 'Идентификатор пользователя, создавшего комнату',
  })
  userId: string;

  @ApiProperty({
    example: '2026-11-11T15:49:00.000Z',
    description: 'Дата и время создания комнаты',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-11-11T15:50:00.000Z',
    description: 'Дата и время последнего обновления комнаты',
  })
  updatedAt: Date;
}
