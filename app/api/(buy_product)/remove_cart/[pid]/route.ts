import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await context?.params;

    if (!pid) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const product = await tx.userProduct.findUnique({
        where: { id: pid },
        select: { id: true, userId: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      await tx.userProduct.delete({
        where: { id: pid },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

