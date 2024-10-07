-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubLink" TEXT,
ADD COLUMN     "linkedinLink" TEXT,
ADD COLUMN     "portfolio" TEXT;

-- CreateTable
CREATE TABLE "SavedPosts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "SavedPosts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedPosts" ADD CONSTRAINT "SavedPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPosts" ADD CONSTRAINT "SavedPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
