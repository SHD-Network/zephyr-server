-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "groupChatsId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "groupChatsId" TEXT;

-- CreateTable
CREATE TABLE "GroupChats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupChats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupChatsId_fkey" FOREIGN KEY ("groupChatsId") REFERENCES "GroupChats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_groupChatsId_fkey" FOREIGN KEY ("groupChatsId") REFERENCES "GroupChats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
