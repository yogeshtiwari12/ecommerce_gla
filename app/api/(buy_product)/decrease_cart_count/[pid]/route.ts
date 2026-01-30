import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";


export async function POST(
    request: Request,
    context : { params: Promise<{ pid: string }> }
) {
    try {
        const { pid } = await context.params;
        console.log("pid",pid)

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({
                message: "Authentication required",
                success: false,
                status: 401,
            });
        }

        console.log("Session User ID:", session.user.id);
        const add_data_update = await prisma.userProduct.findFirst({
            where: {
                OR: [   
                    { id: pid },
                ]

            }
        });
        console.log("updated data : ",add_data_update)
        if (!add_data_update) {
            return NextResponse.json({
                message: "Product not found",
                success: false,
                status: 404
            });
        }

        await prisma.userProduct.update({
            where: { id: add_data_update.id  },
            data: {
                user_product_cart_count: (add_data_update.user_product_cart_count || 0) - 1
            }
        });

        return Response.json({
            message: "Product Quantity updated",
            success: true,
            status: 200
        });
    }



    catch (error) {
        console.error("Error updating product:", error);
        return Response.json(
            { message: "Failed to update product", error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}
