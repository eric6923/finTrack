-- CreateTable
CREATE TABLE "AllRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" JSONB,
    "gstin" TEXT,
    "aadhar" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllRequest_email_key" ON "AllRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AllRequest_userName_key" ON "AllRequest"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "AllRequest_aadhar_key" ON "AllRequest"("aadhar");

-- CreateIndex
CREATE UNIQUE INDEX "AllRequest_pan_key" ON "AllRequest"("pan");
