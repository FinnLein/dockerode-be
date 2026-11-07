import { faker } from '@faker-js/faker';
import argon2 from 'argon2';
import { PrismaClient, UserRole } from '../../src/generated/prisma/client';

export async function seedUsers(prisma: PrismaClient, count = 5) {
	console.log('🌱 Seeding users...');

	const adminEmail = 'admin@example.com';
	const adminPassword = 'admin12345';
	const adminPasswordHash = await argon2.hash(adminPassword);

	const usersData = [
		{
			email: adminEmail,
			password: adminPasswordHash,
			role: UserRole.admin,
			createdAt: faker.date.past(),
		},
		...Array.from({ length: count }).map(() => ({
			email: faker.internet.email().toLowerCase(),
			password: 'password123',
			createdAt: faker.date.past(),
		})),
	];

	const created = await prisma.user.createMany({
		data: usersData,
		skipDuplicates: true,
	});

	console.log(`✅ Seeded ${created.count} users.`);
	console.log(`👑 Admin: ${adminEmail} / ${adminPassword}`);
}