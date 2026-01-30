import { getServerSession } from "next-auth";
import { authOptions } from "../../(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({
            message: "session not found",
            status: 401,
            success: false
        });
    }

    const userData = await prisma.user.findMany();
    const userIds = userData.map(user => user.id);
    const productData = await prisma.userProduct.findMany({
        where: {
            userId: { in: userIds }
        }
    });

    const combined = userData.map(user => {
        const userItems = productData.filter(product =>
            product.userId &&
            product.userId.toString() === user.id.toString() &&
            product.isorderConfirmbyUser === true
        );
        const same_user_totalItems = userItems.reduce(
            (sum, product) => sum + (product.user_product_cart_count || 0), 0
        );
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            items: userItems,
            same_user_totalItems
        };
    });

    return NextResponse.json({
        message: "success",
        status: 200,
        success: true,
        users: combined
    });
}
