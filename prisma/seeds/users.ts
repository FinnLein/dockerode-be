import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedUsers(prisma: PrismaClient, count = 5) {
	console.log('🌱 Seeding users...');

	const usersData = Array.from({ length: count }).map(() => ({
		email: faker.internet.email().toLowerCase(),
		password: 'password123',
		createdAt: faker.date.past(),
	}));

	const created = await prisma.user.createMany({
		data: usersData,
		skipDuplicates: true,
	});

	console.log(`✅ Seeded ${created.count} users.`);
}
