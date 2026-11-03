import { PrismaService } from '@config/prisma';
import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create.dto';
import { UpdateTaskDto } from './dto/update.dto';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({ data: dto });
  }

  update(id: string, dto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}