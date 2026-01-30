import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const { address } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required", success: false },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { message: "Address is required", success: false },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.userProduct.update({
      where: { id: orderId },
      data: {
        address: address,
      },
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { message: "Order not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Address updated successfully",
        success: true,
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      {
        message: "Failed to update address",
        error: (error as Error).message,
        success: false,
      },
      { status: 500 }
    );
  }
}
