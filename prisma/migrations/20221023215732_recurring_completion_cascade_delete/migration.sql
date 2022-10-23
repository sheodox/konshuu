/*
  Warnings:

  - A unique constraint covering the columns `[userId,recurringTodoId,date]` on the table `RecurringTodoCompletion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RecurringTodoCompletion" DROP CONSTRAINT "RecurringTodoCompletion_recurringTodoId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "RecurringTodoCompletion_userId_recurringTodoId_date_key" ON "RecurringTodoCompletion"("userId", "recurringTodoId", "date");

-- AddForeignKey
ALTER TABLE "RecurringTodoCompletion" ADD CONSTRAINT "RecurringTodoCompletion_recurringTodoId_fkey" FOREIGN KEY ("recurringTodoId") REFERENCES "RecurringTodo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
