-- DropForeignKey
ALTER TABLE "AnytimeTodo" DROP CONSTRAINT "AnytimeTodo_anytimeId_fkey";

-- AddForeignKey
ALTER TABLE "AnytimeTodo" ADD CONSTRAINT "AnytimeTodo_anytimeId_fkey" FOREIGN KEY ("anytimeId") REFERENCES "Anytime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
