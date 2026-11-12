import { PrismaService } from '@config/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
    });
  }

  create(data: Prisma.RoomCreateInput) {
    return this.prisma.room.create({
      data,
      select: {
        id: true,
        taskId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  update(id: string, snapshot: Uint8Array) {
    return this.prisma.room.update({
      where: { id },
      data: {
        snapshot: Buffer.from(snapshot),
      },
    });
  }
}
