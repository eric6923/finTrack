-- CreateTable
CREATE TABLE "CompanyShareDetails" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessCategory" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "numberOfShareHolders" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyShareDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shareholder" (
    "id" SERIAL NOT NULL,
    "companyShareDetailsId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sharePercentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shareholder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyShareDetails_userId_key" ON "CompanyShareDetails"("userId");

-- AddForeignKey
ALTER TABLE "CompanyShareDetails" ADD CONSTRAINT "CompanyShareDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shareholder" ADD CONSTRAINT "Shareholder_companyShareDetailsId_fkey" FOREIGN KEY ("companyShareDetailsId") REFERENCES "CompanyShareDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
