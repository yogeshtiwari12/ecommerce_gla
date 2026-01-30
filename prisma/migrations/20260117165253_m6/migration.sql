/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `ShippingAddress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_id` to the `ShippingAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "product_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ShippingAddress_product_id_key" ON "ShippingAddress"("product_id");
