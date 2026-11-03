/*
  Warnings:

  - Added the required column `description` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `testCases` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "description" JSONB NOT NULL,
DROP COLUMN "testCases",
ADD COLUMN     "testCases" JSONB NOT NULL;
