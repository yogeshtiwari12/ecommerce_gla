import { getServerSession } from "next-auth/next";

import { authOptions } from "../../../(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";
export async function POST(
  request: Request,
  context: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await context.params;
    console.log(pid)

    const isSessionActive = await getServerSession(authOptions);
    if (!isSessionActive) {
      return Response.json({
        message: "Authentication required",
        success: false,
        status: 401,
      });
    }

    const item_data = await prisma.item.findFirst({
      where: {
        AND: [
          { id: pid },
          { stock: { gt: 0 } }
        ]
      }
    });

    if (!item_data) {
      throw new Error("Product not found");
    }
    
    const uniqueItemId = `${item_data.id}`;
    
    // Check if product exists (regardless of cartItem status)
    const isexistingProduct = await prisma.userProduct.findFirst({
      where: {
        user_product_item_id: uniqueItemId,
        userId: isSessionActive.user.id,
      }
    });

    if (isexistingProduct) {
      // If product exists as cart item, return error
      if (isexistingProduct.cartItem === true) {
        return Response.json({
          message: "Product already in cart",
          success: false,
          status: 400,
        });
      }
      
      // If product exists but cartItem is false (was ordered before), update it to cart item
      await prisma.userProduct.update({
        where: { id: isexistingProduct.id },
        data: {
          cartItem: true,
          // isorderConfirmbyUser: false,
          user_product_cart_count: 1, // Reset count to 1 for new cart addition
        }
      });

      return Response.json({
        message: "Product added to cart successfully",
        success: true,
        status: 200,
      });
    }

    // Create new cart item if doesn't exist
    await prisma.userProduct.create({
      data: {
        product_name: item_data.name,
        user_product_description: item_data.description,
        user_product_price: item_data.price,
        user_product_category: item_data.category,
        userId: isSessionActive.user.id,
        productId: pid,
        user_product_cart_count: 1,
        cartItem: true,
        isorderConfirmbyUser: false,
        user_product_item_id: uniqueItemId,
        user_product_imageUrl: item_data.imageUrl || null
      },
    });

    return Response.json({
      message: "Product added to cart successfully",
      success: true,
      status: 200,
    });
  }
  catch (error) {
    console.error("Error updating product:", error);
    return Response.json(
      {
        message: "Failed to update product",
        error: (error as Error).message,
        success: false,
      },
      { status: 500 }
    );
  }
}
