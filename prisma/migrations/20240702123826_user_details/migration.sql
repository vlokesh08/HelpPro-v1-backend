/*
  Warnings:

  - You are about to drop the `SavedPosts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedProjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SavedPosts" DROP CONSTRAINT "SavedPosts_postId_fkey";

-- DropForeignKey
ALTER TABLE "SavedPosts" DROP CONSTRAINT "SavedPosts_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavedProjects" DROP CONSTRAINT "SavedProjects_projectId_fkey";

-- DropForeignKey
ALTER TABLE "SavedProjects" DROP CONSTRAINT "SavedProjects_userId_fkey";

-- DropTable
DROP TABLE "SavedPosts";

-- DropTable
DROP TABLE "SavedProjects";

-- CreateTable
CREATE TABLE "Saved" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPost" BOOLEAN NOT NULL DEFAULT false,
    "isProject" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "Saved_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
