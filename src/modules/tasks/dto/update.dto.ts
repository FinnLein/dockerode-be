import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
