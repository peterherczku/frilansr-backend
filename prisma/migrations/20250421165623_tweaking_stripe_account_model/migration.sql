/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `StripeAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StripeAccount_userId_key" ON "StripeAccount"("userId");
