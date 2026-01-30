/*
  Warnings:

  - You are about to drop the column `user_product_imageUrl` on the `UserProduct` table. All the data in the column will be lost.
  - Added the required column `user_product_imageUrl2` to the `UserProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProduct" DROP COLUMN "user_product_imageUrl",
ADD COLUMN     "user_product_imageUrl2" TEXT NOT NULL;
