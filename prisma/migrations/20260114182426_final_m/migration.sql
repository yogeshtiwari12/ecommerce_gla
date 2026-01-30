/*
  Warnings:

  - Added the required column `item_product_id` to the `PaymentDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentDetails" ADD COLUMN     "item_product_id" UUID NOT NULL;
