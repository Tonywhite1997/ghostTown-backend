/*
  Warnings:

  - You are about to drop the column `last_message_timeStamp` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorID_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "last_message_timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "last_message_timeStamp",
ADD COLUMN     "photoURL" TEXT,
ALTER COLUMN "body" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
