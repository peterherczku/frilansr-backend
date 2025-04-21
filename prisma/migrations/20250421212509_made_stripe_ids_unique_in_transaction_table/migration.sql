/*
  Warnings:

  - You are about to drop the column `transferId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeTransferId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transferId",
ADD COLUMN     "stripeTransferId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_stripePaymentIntentId_key" ON "Transaction"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_stripeTransferId_key" ON "Transaction"("stripeTransferId");
