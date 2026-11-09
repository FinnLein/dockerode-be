import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';

const LANGUAGES = ['javascript', 'golang', 'python'] as const;

const CODE_TEMPLATES: Record<string, string> = {
  javascript: 'function solution(a, b) {\n  // Write your code here\n  return a + b;\n}',
  golang: 'func solution(a int, b int) int {\n    // Write your code here\n    return a + b\n}',
  python: 'def solution(a, b):\n    # Write your code here\n    return a + b',
};

export async function seedTasks(prisma: PrismaClient, count = 20) {
  console.log('🌱 Seeding tasks...');

  const tasksData = Array.from({ length: count }).map(() => {
    const title = faker.hacker.phrase();
    const description = { html: `<p>${faker.lorem.paragraph()}</p>` };

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
      language: [...LANGUAGES],
      initialCode: LANGUAGES.map((lang) => ({
        language: lang,
        template: CODE_TEMPLATES[lang],
      })),
      testCases,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  });

  const created = await prisma.$transaction(
    tasksData.map((task) =>
      prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          language: task.language,
          testCases: task.testCases,
          initialCode: {
            create: task.initialCode,
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      })
    )
  );

  console.log(`✅ Seeded ${created.length} tasks.`);
}