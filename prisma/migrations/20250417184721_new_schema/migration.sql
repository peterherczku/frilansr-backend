/*
  Warnings:

  - You are about to drop the column `lastMessageAt` on the `Conversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lastMessageId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "lastMessageAt",
ADD COLUMN     "lastMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_lastMessageId_key" ON "Conversation"("lastMessageId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
