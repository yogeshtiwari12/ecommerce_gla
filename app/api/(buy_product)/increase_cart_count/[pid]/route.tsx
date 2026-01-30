import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request,ctx:any)
{
    try {
        const {pid} = await ctx.params
     
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({
                message: "Authentication required",
                success: false,
                status: 401,
            });
        }

        const add_data_update = await prisma.userProduct.findFirst({
            where: {
                id: pid, 
            }
        });

        if (!add_data_update) {
            return NextResponse.json({
                message: "Product not found",
                success: false,
                status: 404
            });
        }

        console.log(pid)
    

        await prisma.userProduct.update({
            where: { id: add_data_update.id },
            data: {
                user_product_cart_count: (add_data_update.user_product_cart_count || 0) + 1,
                user_product_unit_total: ((add_data_update.user_product_cart_count || 0) + 1)*(add_data_update.user_product_price),
            }
        });

        return NextResponse.json({
            message: "Product Quantity updated",
            success: true,
            status: 200
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { message: "Failed to update product", error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}
