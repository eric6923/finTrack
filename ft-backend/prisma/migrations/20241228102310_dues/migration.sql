-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "remainingDue" DECIMAL(65,30) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "remainingDue" DECIMAL(65,30) NOT NULL DEFAULT 0.0;
