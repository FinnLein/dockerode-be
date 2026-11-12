import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './dto';
import { TasksService } from './tasks.service';

import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOkResponse({ type: [TaskResponseDto] })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskResponseDto })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: TaskResponseDto })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Post('bulk')
  @ApiCreatedResponse({ description: 'Количество созданных задач' })
  createBulk(
    @Body(new ParseArrayPipe({ items: CreateTaskDto }))
    dtos: CreateTaskDto[],
  ) {
    return this.tasksService.createBulk(dtos);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TaskResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskResponseDto })
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }

  @Delete()
  deleteBulk() {
    return this.tasksService.deleteBulk();
  }
}
