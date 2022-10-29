/*
  Warnings:

  - Added the required column `countHistory` to the `Anytime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentDayTime` to the `Anytime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anytime" ADD COLUMN     "countHistory" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "currentDayTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetsDaily" BOOLEAN NOT NULL DEFAULT false;
