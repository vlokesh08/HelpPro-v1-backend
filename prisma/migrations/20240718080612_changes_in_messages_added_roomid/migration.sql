-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "roomId" TEXT,
ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;
