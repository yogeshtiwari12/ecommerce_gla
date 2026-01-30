/*
  Warnings:

  - The primary key for the `ShippingAddress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `addressId` on the `UserProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[product_id]` on the table `ShippingAddress` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `ShippingAddress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserProduct" DROP CONSTRAINT "UserProduct_addressId_fkey";

-- AlterTable
ALTER TABLE "ShippingAddress" DROP CONSTRAINT "ShippingAddress_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserProduct" DROP COLUMN "addressId";

-- CreateIndex
CREATE UNIQUE INDEX "ShippingAddress_product_id_key" ON "ShippingAddress"("product_id");
