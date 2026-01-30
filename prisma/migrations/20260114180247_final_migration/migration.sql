/*
  Warnings:

  - You are about to drop the column `address` on the `UserProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProduct" DROP COLUMN "address",
ADD COLUMN     "addressId" INTEGER;

-- CreateTable
CREATE TABLE "ShippingAddress" (
    "id" SERIAL NOT NULL,
    "phoneNumber" VARCHAR(15) NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentDetails" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDetails_orderId_key" ON "PaymentDetails"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDetails_transactionId_key" ON "PaymentDetails"("transactionId");

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "ShippingAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
