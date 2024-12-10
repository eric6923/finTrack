/*
  Warnings:

  - You are about to drop the column `Due` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Due",
ADD COLUMN     "due" DECIMAL(65,30) NOT NULL DEFAULT 0.0;
