-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "initialCode" TEXT NOT NULL,
    "testCases" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_language_idx" ON "Task"("language");
