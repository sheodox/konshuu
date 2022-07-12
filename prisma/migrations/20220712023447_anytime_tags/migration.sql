-- CreateTable
CREATE TABLE "AnytimeTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "AnytimeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnytimeTagAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anytimeId" TEXT NOT NULL,
    "anytimeTagId" TEXT NOT NULL,

    CONSTRAINT "AnytimeTagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnytimeTag_userId_idx" ON "AnytimeTag"("userId");

-- CreateIndex
CREATE INDEX "AnytimeTagAssignment_userId_idx" ON "AnytimeTagAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnytimeTagAssignment_userId_anytimeId_anytimeTagId_key" ON "AnytimeTagAssignment"("userId", "anytimeId", "anytimeTagId");

-- AddForeignKey
ALTER TABLE "AnytimeTag" ADD CONSTRAINT "AnytimeTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnytimeTagAssignment" ADD CONSTRAINT "AnytimeTagAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnytimeTagAssignment" ADD CONSTRAINT "AnytimeTagAssignment_anytimeId_fkey" FOREIGN KEY ("anytimeId") REFERENCES "Anytime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnytimeTagAssignment" ADD CONSTRAINT "AnytimeTagAssignment_anytimeTagId_fkey" FOREIGN KEY ("anytimeTagId") REFERENCES "AnytimeTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
