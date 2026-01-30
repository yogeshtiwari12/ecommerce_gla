-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('delivered', 'cancelled', 'pending', 'shipped', 'in_transit', 'picked_up');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "otp" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyCodeExpiry" TIMESTAMP(3),
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProduct" (
    "id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "user_product_description" TEXT NOT NULL,
    "user_product_price" INTEGER NOT NULL,
    "user_product_category" TEXT NOT NULL,
    "user_product_item_id" TEXT NOT NULL,
    "user_product_cart_count" INTEGER DEFAULT 0,
    "userId" UUID,
    "iscancelled" BOOLEAN DEFAULT false,
    "isdelivered" BOOLEAN DEFAULT false,
    "isorderConfirmbyUser" BOOLEAN NOT NULL DEFAULT false,
    "cartItem" BOOLEAN NOT NULL DEFAULT false,
    "productId" UUID NOT NULL,
    "product_delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'pending',
    "address" TEXT,
    "cancel_order_otp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "itemid" TEXT,
    "reason" TEXT,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProduct_user_product_item_id_key" ON "UserProduct"("user_product_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Item_itemid_key" ON "Item"("itemid");

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
