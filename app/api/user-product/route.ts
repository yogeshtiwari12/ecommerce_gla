import { getServerSession } from "next-auth/next";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../(auth)/auth/[...nextauth]/options";
import { sendDeliveryEmail } from "../component/delivery_details";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      product_name,
      user_product_description,
      user_product_price,
      user_product_category,
      user_product_item_id,
      user_product_imageUrl,
    } = body;

    if (
      !product_name ||
      !user_product_description ||
      !user_product_price ||
      !user_product_category ||
      !user_product_item_id
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session is invalid or expired" },
        { status: 401 }
      );
    }
    
    const existingUserProduct = await prisma.userProduct.findFirst({
      where: {
        userId: session.user.id,
        user_product_item_id: user_product_item_id,
        cartItem: false,
        isorderConfirmbyUser: true,
      },
    });
    

    if (existingUserProduct) {
      // Update quantity for existing confirmed order
      const updatedProduct = await prisma.userProduct.update({
        where: { id: existingUserProduct.id },
        data: {
          user_product_cart_count: (existingUserProduct.user_product_cart_count || 1) + 1,
        },
      });
      

      return NextResponse.json(
        { 
          success: true, 
          message: "Order quantity updated", 
          product: updatedProduct,
          alreadyExists: true,
          emailSent: false
        },
        { status: 200 }
      );
    }
    

    const userProduct = await prisma.userProduct.create({
      data: {
        product_name,
        user_product_description,
        user_product_price,
        user_product_category,
        user_product_item_id,
        user_product_imageUrl: user_product_imageUrl || null,
        userId: session.user.id,
        productId: user_product_item_id,
        isorderConfirmbyUser: true,
        cartItem: false,
        user_product_cart_count: 1,
      },
    });

    const shipping = await prisma.shippingAddress.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!shipping) {
      return NextResponse.json(
        { success: false, message: "Shipping address not found for user" },
        { status: 400 }
      );
    }

    
    const orderId = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const orderDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailResult = await sendDeliveryEmail(
      {
        orderId,
        orderDate,
        customerName: session.user.name || "Customer",
        phoneNumber: shipping.phoneNumber,
        streetAddress: shipping.streetAddress,
        city: shipping.city,
        state: shipping.state,
        pinCode: shipping.pinCode,
        items: [
          {
            name: product_name,
            quantity: 1,
            price: `₹${user_product_price}`,
          },
        ],
        product_name,
        user_product_category,
        user_product_description,
        user_product_imageUrl: user_product_imageUrl || undefined,
        user_product_price: `₹${user_product_price}`,
        user_name: session.user.name || "",
        user_email: session.user.email || "",
      },
      session.user.email || ""
    );
    

    return NextResponse.json(
      { 
        success: true, 
        message: "Product added successfully", 
        product: userProduct,
        emailSent: emailResult.success,
        emailMessage: emailResult.message,
        alreadyExists: false
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { cartItems } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session is invalid or expired" },
        { status: 401 }
      );
    }

    const cartItemIds = cartItems.map((item: any) => item.id).filter(Boolean);
    

    const updatePromises = cartItemIds.map(async (itemId: string) => {
      const itemAddress = await prisma.shippingAddress.findUnique({
        where: { product_id: itemId }
      });

      return await prisma.userProduct.update({
        where: { id: itemId },
        data: {
          isorderConfirmbyUser: true,
          cartItem: false,
          ...(itemAddress && { productId: itemAddress.id })
        },
      });
    });

    const updateResults = await Promise.all(updatePromises);
    

    if (updateResults.length === 0) {
      return NextResponse.json(
        { success: false, message: "No cart items were updated. They may have already been ordered." },
        { status: 400 }
      );
    }

    const orderDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const addressIds = cartItemIds.map((id: string) => id);
    const addresses = await prisma.shippingAddress.findMany({
      where: { 
        product_id: { in: addressIds }
      }
    });
    
    const addressGroups = new Map<string, any[]>();
    
    cartItems.forEach((item: any) => {
      const itemAddress = addresses.find(addr => addr.product_id === item.id);
      if (itemAddress) {
        const key = `${itemAddress.streetAddress}-${itemAddress.pinCode}`;
        if (!addressGroups.has(key)) {
          addressGroups.set(key, []);
        }
        addressGroups.get(key)?.push({ item, address: itemAddress });
      }
    });
    
    const emailPromises = Array.from(addressGroups.values()).map(async (group) => {
      const address = group[0].address;
      const orderId = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      
      const emailItems = group.map(({ item }: any) => ({
        name: item.product_name,
        quantity: item.user_product_cart_count || 1,
        price: `₹${(item.user_product_price * (item.user_product_cart_count || 1)).toLocaleString()}`,
      }));

      return await sendDeliveryEmail(
        {
          orderId,
          orderDate,
          customerName: session.user.name || "Customer",
          phoneNumber: address.phoneNumber,
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          pinCode: address.pinCode,
          items: emailItems,
          user_name: session.user.name || "",
          user_email: session.user.email || "",
        },
        session.user.email || ""
      );
    });

    const emailResults = await Promise.all(emailPromises);
    
    const successfulEmails = emailResults.filter(result => result.success).length;
    const failedEmails = emailResults.filter(result => !result.success);
    

    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully ordered ${updateResults.length} items`,
        ordersCreated: updateResults.length,
        emailsSent: successfulEmails,
        emailsFailed: failedEmails.length
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
