-- CreateTable
CREATE TABLE "StripeAccount" (
    "id" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeAccountId" TEXT,

    CONSTRAINT "StripeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeAccount_stripeCustomerId_key" ON "StripeAccount"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeAccount_stripeAccountId_key" ON "StripeAccount"("stripeAccountId");
