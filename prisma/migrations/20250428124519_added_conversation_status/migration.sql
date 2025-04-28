-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE';
