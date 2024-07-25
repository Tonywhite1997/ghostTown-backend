-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "last_message" TEXT NOT NULL DEFAULT 'no new message',
ADD COLUMN     "unread_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_message_timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
