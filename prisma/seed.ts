import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
// Импортируем клиент из вашего кастомного пути генерации
import { PrismaClient } from '../src/generated/prisma/client';
import { seedTasks } from './seeds/tasks';
import { seedUsers } from './seeds/users';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Cleaning up database...');
  
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  await seedUsers(prisma, 10);
  await seedTasks(prisma, 30);

  console.log('🏁 Seeding finished successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
