import { ApiProperty } from '@nestjs/swagger';

export class EvalResponseDto {
	@ApiProperty({ example: 'a1b2c3d4-...' })
	jobId: string;
}