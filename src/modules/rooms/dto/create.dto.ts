import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsUUID()
  taskId: string;

  @IsString()
  @IsOptional()
  initialCode?: string;

  @IsString()
  @IsOptional()
  language?: string;
}
