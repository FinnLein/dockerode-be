import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GuestLoginDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name?: string;
}
