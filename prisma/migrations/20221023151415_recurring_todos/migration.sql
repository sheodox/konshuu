-- CreateTable
CREATE TABLE "RecurringTodo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "list" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "repeats" TEXT NOT NULL,
    "repeatEvery" INTEGER NOT NULL,
    "weeklyDayRepeats" TEXT[],

    CONSTRAINT "RecurringTodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTodoCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recurringTodoId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "RecurringTodoCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringTodo_userId_idx" ON "RecurringTodo"("userId");

-- CreateIndex
CREATE INDEX "RecurringTodoCompletion_userId_date_idx" ON "RecurringTodoCompletion"("userId", "date");

-- AddForeignKey
ALTER TABLE "RecurringTodo" ADD CONSTRAINT "RecurringTodo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTodoCompletion" ADD CONSTRAINT "RecurringTodoCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTodoCompletion" ADD CONSTRAINT "RecurringTodoCompletion_recurringTodoId_fkey" FOREIGN KEY ("recurringTodoId") REFERENCES "RecurringTodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
