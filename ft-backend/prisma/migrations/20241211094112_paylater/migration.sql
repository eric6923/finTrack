-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'PARTIAL');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentType" "PaymentType";
