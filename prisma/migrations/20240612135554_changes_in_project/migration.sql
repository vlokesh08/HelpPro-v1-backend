/*
  Warnings:

  - Added the required column `bountyValue` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "bountyValue" INTEGER NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL;
