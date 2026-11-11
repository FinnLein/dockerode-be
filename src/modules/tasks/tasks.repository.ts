import { PrismaService } from '@config/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: { initialCode: true },
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { initialCode: true },
    });
  }

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        description: dto.description as unknown as Prisma.InputJsonValue,
        testCases: dto.testCases as unknown as Prisma.InputJsonValue,
        initialCode: {
          create: dto.initialCode.map((item) => ({
            language: item.language,
            template: item.template,
          })),
        },
      },
      include: { initialCode: true },
    });
  }

  async createBulk(dtos: CreateTaskDto[]) {
    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.task.create({
          data: {
            title: dto.title,
            description: dto.description as Prisma.InputJsonValue,
            language: dto.language,
            testCases: dto.testCases as unknown as Prisma.InputJsonValue,
            initialCode: {
              create: dto.initialCode.map((item) => ({
                language: item.language,
                template: item.template,
              })),
            },
          },
        }),
      ),
    );
  }

  update(id: string, dto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        description: dto.description as unknown as Prisma.InputJsonValue,
        testCases: dto.testCases as unknown as Prisma.InputJsonValue,
        initialCode: {
          create:
            dto.initialCode &&
            dto.initialCode.map((item) => ({
              language: item.language,
              template: item.template,
            })),
        },
      },
      include: { initialCode: true },
    });
  }

  delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  deleteBulk() {
    return this.prisma.task.deleteMany();
  }
}
