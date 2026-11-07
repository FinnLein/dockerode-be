import { PrismaService } from '@config/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) { }

  findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        description: dto.description as unknown as Prisma.InputJsonValue,
        testCases: dto.testCases as unknown as Prisma.InputJsonValue,
      },
    });
  }

  createBulk(dtos: CreateTaskDto[]) {
    return this.prisma.task.createMany({
      data: dtos.map((dto) => ({
        ...dto,
        description: dto.description as unknown as Prisma.InputJsonValue,
        testCases: dto.testCases as unknown as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    })
  }

  update(id: string, dto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        description: dto.description as unknown as Prisma.InputJsonValue,
        testCases: dto.testCases as unknown as Prisma.InputJsonValue,
      },
    });
  }

  delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  deleteBulk() {
    return this.prisma.task.deleteMany()
  }
}
