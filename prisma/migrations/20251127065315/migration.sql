/*
  Warnings:

  - You are about to drop the column `user_product_imageUrl2` on the `UserProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProduct" DROP COLUMN "user_product_imageUrl2",
ADD COLUMN     "user_product_imageUrl" TEXT;
