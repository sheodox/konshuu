-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "href" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Anytime" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "showCountUp" BOOLEAN NOT NULL DEFAULT true,
    "showCountDown" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Anytime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnytimeTodo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "href" TEXT NOT NULL DEFAULT '',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "anytimeId" TEXT NOT NULL,

    CONSTRAINT "AnytimeTodo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Anytime_userId_idx" ON "Anytime"("userId");

-- CreateIndex
CREATE INDEX "AnytimeTodo_userId_anytimeId_idx" ON "AnytimeTodo"("userId", "anytimeId");

-- AddForeignKey
ALTER TABLE "Anytime" ADD CONSTRAINT "Anytime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnytimeTodo" ADD CONSTRAINT "AnytimeTodo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnytimeTodo" ADD CONSTRAINT "AnytimeTodo_anytimeId_fkey" FOREIGN KEY ("anytimeId") REFERENCES "Anytime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
