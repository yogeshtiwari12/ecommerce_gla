import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";

type SalesByCategoryRow = {
    category: string;
    total_sales: number;
    orders_count: number;
};

type RecentOrderRow = {
    Order: string | null;
    Customer: string;
    Total: number;
    Status: string;
    Date: string;
};

type RecentOrderRaw = {
    id: string;
    user_product_item_id: string;
    user_product_unit_total: number | null;
    user_product_price: number;
    user_product_cart_count: number | null;
    product_delivery_status: string;
    createdAt: Date;
    User: {
        name: string;
        email: string;
    } | null;
};

export async function GET(_request: Request) {
    try {
        const user = await getServerSession(authOptions);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }
        
        const [salesRows, recentOrdersRaw] = await prisma.$transaction([
            prisma.userProduct.findMany({
                where: { isorderConfirmbyUser: true },
                select: {
                    user_product_category: true,
                    user_product_unit_total: true,
                    user_product_price: true,
                    user_product_cart_count: true,
                },
            }),
            prisma.userProduct.findMany({
                where: { isorderConfirmbyUser: true },
                take: 5,
                orderBy: { updatedAt: "desc" },
                select: {
                    id: true,
                    user_product_item_id: true,
                    user_product_unit_total: true,
                    user_product_price: true,
                    user_product_cart_count: true,
                    product_delivery_status: true,
                    createdAt: true,
                    User: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        ]);

        const recentIds = recentOrdersRaw.map((order) => order.id);
        const payments = recentIds.length>0
            ? await prisma.paymentDetails.findMany({
                where: { item_product_id: { in: recentIds } },
                select: { item_product_id: true, amount: true },
            })
            : [];

        const paymentMap = new Map<string, number>(
            payments.map((payment) => [payment.item_product_id, payment.amount])
        );

        const salesAccumulator = new Map<string, { total_sales: number; orders_count: number }>();

        for (const row of salesRows) {
            const fallbackTotal =
                row.user_product_unit_total ??
                row.user_product_price * (row.user_product_cart_count && row.user_product_cart_count > 0 ? row.user_product_cart_count : 1);

            const existing = salesAccumulator.get(row.user_product_category);
            if (existing) {
                existing.total_sales += fallbackTotal;
                existing.orders_count += 1;
            } else {
                salesAccumulator.set(row.user_product_category, {
                    total_sales: fallbackTotal,
                    orders_count: 1,
                });
            }
        }

        const salesByCategory: SalesByCategoryRow[] = Array.from(salesAccumulator.entries())
            .map(([category, metrics]) => ({
                category,
                total_sales: metrics.total_sales,
                orders_count: metrics.orders_count,
            }))
            .sort((a, b) => b.total_sales - a.total_sales);

        const recentOrders: RecentOrderRow[] = recentOrdersRaw.map((order) => {
            const fallbackTotal =
                order.user_product_unit_total ??
                order.user_product_price * (order.user_product_cart_count && order.user_product_cart_count > 0 ? order.user_product_cart_count : 1);

            return {
                Order: order.user_product_item_id,
                Customer: order.User?.name ?? order.User?.email ?? "Unknown",
                Total: paymentMap.get(order.id) ?? fallbackTotal,
                Status: order.product_delivery_status,
                Date: order.createdAt.toISOString(),
            };
        });
        const [revenue, u_data, product] = await prisma.$transaction([
            prisma.paymentDetails.aggregate({
                _sum: {
                    amount: true,
                },
                _count: {
                    id: true,
                },
            }),
            prisma.user.aggregate({
                _count: {
                    id: true,
                },
            }),
            prisma.item.aggregate({
                _count: {
                    id: true,
                },
            }),
        ]);

        const revenuedata = {
            totalRevenue: revenue._sum.amount ?? 0,
            totalOrders: revenue._count.id,
            totalUsers: u_data._count.id,
            totalProducts: product._count.id,
        };
        return NextResponse.json({
            success: true,
            salesByCategory,
            recentOrders,
            revenuedata,
        });
    } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}