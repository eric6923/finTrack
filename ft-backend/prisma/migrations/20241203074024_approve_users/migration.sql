-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI');

-- CreateTable
CREATE TABLE "PaymentVerification" (
    "id" SERIAL NOT NULL,
    "pendingUserId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "upiTransactionId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentVerification_pendingUserId_key" ON "PaymentVerification"("pendingUserId");

-- AddForeignKey
ALTER TABLE "PaymentVerification" ADD CONSTRAINT "PaymentVerification_pendingUserId_fkey" FOREIGN KEY ("pendingUserId") REFERENCES "PendingUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
