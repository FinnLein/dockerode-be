/*
  Warnings:

  - The `language` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('javascript', 'golang');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "language",
ADD COLUMN     "language" "Language"[];

-- CreateIndex
CREATE INDEX "Task_language_idx" ON "Task"("language");
