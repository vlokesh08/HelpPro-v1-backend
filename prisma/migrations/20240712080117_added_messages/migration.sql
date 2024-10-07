-- CreateTable
CREATE TABLE "MessageMiddleware" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "lastMessage" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageMiddleware_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageMiddleware" ADD CONSTRAINT "MessageMiddleware_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
