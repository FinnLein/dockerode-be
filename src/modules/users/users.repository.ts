import { PrismaService } from '@config/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UsersRepository {
	constructor(
		private readonly prisma: PrismaService
	) { }

	findById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			}
		})
	}

	findByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}

	create(data: Prisma.UserCreateInput) {
		return this.prisma.user.create({
			data
		})
	}
}
