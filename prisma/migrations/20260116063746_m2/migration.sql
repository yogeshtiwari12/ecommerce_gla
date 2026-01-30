/*
  Warnings:

  - The primary key for the `PaymentDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `PaymentDetails` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `user_id` to the `ShippingAddress` table without a default value. This is not possible if the table is not empty.
  - Made the column `product_id` on table `ShippingAddress` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaymentDetails" DROP CONSTRAINT "PaymentDetails_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "PaymentDetails_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "product_id" SET NOT NULL;
