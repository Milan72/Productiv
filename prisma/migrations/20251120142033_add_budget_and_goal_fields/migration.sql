-- AlterTable
ALTER TABLE "Goal" ADD COLUMN "currentValue" REAL;
ALTER TABLE "Goal" ADD COLUMN "priority" TEXT;
ALTER TABLE "Goal" ADD COLUMN "targetValue" REAL;
ALTER TABLE "Goal" ADD COLUMN "timeframe" TEXT;

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "budget" REAL NOT NULL,
    "spent" REAL NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
