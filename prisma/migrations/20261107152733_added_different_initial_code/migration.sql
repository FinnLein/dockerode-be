/*
  Warnings:

  - You are about to drop the column `initialCode` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "initialCode";

-- CreateTable
CREATE TABLE "LanugageInitalCode" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "template" TEXT NOT NULL,

    CONSTRAINT "LanugageInitalCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LanugageInitalCode_taskId_language_key" ON "LanugageInitalCode"("taskId", "language");

-- AddForeignKey
ALTER TABLE "LanugageInitalCode" ADD CONSTRAINT "LanugageInitalCode_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
