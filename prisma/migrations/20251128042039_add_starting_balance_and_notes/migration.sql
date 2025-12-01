-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "startingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
