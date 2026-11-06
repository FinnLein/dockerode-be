import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';

const LANGUAGES = ['javascript', 'go'];

const CODE_TEMPLATES: Record<string, string> = {
  javascript: 'function solution(a, b) {\n  // Write your code here\n  return a + b;\n}',
  go: 'func solution(a int, b int) int {\n    // Write your code here\n    return a + b\n}',
};

export async function seedTasks(prisma: PrismaClient, count = 20) {
  console.log('🌱 Seeding tasks...');

  const tasksData = Array.from({ length: count }).map(() => {
    const title = faker.hacker.phrase();
    const description = faker.lorem.paragraph(); 
    const language = faker.helpers.arrayElement(LANGUAGES);
    const initialCode = CODE_TEMPLATES[language] || '// write code';

    const testCasesCount = faker.number.int({ min: 2, max: 5 });

    const testCases = Array.from({ length: testCasesCount }).map(() => {
      const num1 = faker.number.int({ min: 1, max: 100 });
      const num2 = faker.number.int({ min: 1, max: 100 });

      return {
        input: JSON.stringify([num1, num2]),
        expected: `${num1 + num2}`,
      };
    });

    return {
      title,
      description,
      language,
      initialCode,
      testCases,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  });

  const created = await prisma.task.createMany({
    data: tasksData,
  });

  console.log(`✅ Seeded ${created.count} tasks.`);
}