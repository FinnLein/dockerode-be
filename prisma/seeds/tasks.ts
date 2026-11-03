import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';

const LANGUAGES = ['javascript', 'typescript', 'python', 'go', 'rust'];

const CODE_TEMPLATES: Record<string, string> = {
  javascript: 'function solution(a, b) {\n  // Write your code here\n  return a + b;\n}',
  typescript: 'function solution(a: number, b: number): number {\n  // Write your code here\n  return a + b;\n}',
  python: 'def solution(a: int, b: int) -> int:\n    # Write your code here\n    return a + b',
  go: 'package main\n\nfunc solution(a int, b int) int {\n    // Write your code here\n    return a + b\n}',
  rust: 'fn solution(a: i32, b: i32) -> i32 {\n    // Write your code here\n    a + b\n}',
};

export async function seedTasks(prisma: PrismaClient, count = 20) {
  console.log('🌱 Seeding tasks...');

  const tasksData = Array.from({ length: count }).map(() => {
    const language = faker.helpers.arrayElement(LANGUAGES);
    const initialCode = CODE_TEMPLATES[language] || '// write code';
    

    const testCasesCount = faker.number.int({ min: 2, max: 5 });
    const testCases = Array.from({ length: testCasesCount }).map(() => 
      `assert(solution(${faker.number.int({ min: 1, max: 100 })}, ${faker.number.int({ min: 1, max: 100 })}))`
    );

    return {
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
