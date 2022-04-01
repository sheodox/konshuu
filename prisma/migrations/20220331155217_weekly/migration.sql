-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_userId_fkey";

-- CreateTable
CREATE TABLE "Weekly" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "goal" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Weekly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weeklyId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "goal" INTEGER NOT NULL,
    "week" TEXT NOT NULL,

    CONSTRAINT "WeeklyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Weekly_userId_idx" ON "Weekly"("userId");

-- CreateIndex
CREATE INDEX "WeeklyProgress_userId_week_idx" ON "WeeklyProgress"("userId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyProgress_userId_weeklyId_week_key" ON "WeeklyProgress"("userId", "weeklyId", "week");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weekly" ADD CONSTRAINT "Weekly_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyProgress" ADD CONSTRAINT "WeeklyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyProgress" ADD CONSTRAINT "WeeklyProgress_weeklyId_fkey" FOREIGN KEY ("weeklyId") REFERENCES "Weekly"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Todo.userId_date_index" RENAME TO "Todo_userId_date_idx";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";
