/*
  Warnings:

  - You are about to drop the column `product_id` on the `ShippingAddress` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ShippingAddress_product_id_key";

-- AlterTable
ALTER TABLE "ShippingAddress" DROP COLUMN "product_id";
