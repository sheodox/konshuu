-- DropForeignKey
ALTER TABLE "AnytimeTagAssignment" DROP CONSTRAINT "AnytimeTagAssignment_anytimeId_fkey";

-- DropForeignKey
ALTER TABLE "AnytimeTagAssignment" DROP CONSTRAINT "AnytimeTagAssignment_anytimeTagId_fkey";

-- AddForeignKey
ALTER TABLE "AnytimeTagAssignment" ADD CONSTRAINT "AnytimeTagAssignment_anytimeId_fkey" FOREIGN KEY ("anytimeId") REFERENCES "Anytime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnytimeTagAssignment" ADD CONSTRAINT "AnytimeTagAssignment_anytimeTagId_fkey" FOREIGN KEY ("anytimeTagId") REFERENCES "AnytimeTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
