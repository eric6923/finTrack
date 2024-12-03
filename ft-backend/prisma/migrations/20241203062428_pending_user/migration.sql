-- CreateTable
CREATE TABLE "PendingUser" (
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

    CONSTRAINT "PendingUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_email_key" ON "PendingUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_userName_key" ON "PendingUser"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_aadhar_key" ON "PendingUser"("aadhar");

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_pan_key" ON "PendingUser"("pan");
