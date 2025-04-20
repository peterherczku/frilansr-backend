/*
  Warnings:

  - Added the required column `userId` to the `StripeAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StripeAccount" ADD COLUMN     "userId" TEXT NOT NULL;
