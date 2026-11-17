import { ApiProperty } from '@nestjs/swagger';

export class EvalCollabResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  roomId: string;
}
