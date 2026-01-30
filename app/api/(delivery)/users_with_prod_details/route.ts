import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
    try {
        // Fetch all confirmed orders including cancelled ones
        const userProducts = await prisma.userProduct.findMany({
            where: {
                isorderConfirmbyUser: true // Includes all confirmed orders regardless of delivery status (pending, shipped, delivered, cancelled)
            }
        });

        // Get unique user IDs from userProducts
         const userIds = Array.from(
      new Set(
        userProducts
          .map((p) => p.userId)
          .filter((id): id is string => typeof id === "string")
      )
    );
        // Fetch only users who have confirmed orders
        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds }
            }
        });

        // Fetch addresses by userId
        const addresses = await prisma.shippingAddress.findMany({
            where: {
                userId: { in: userIds }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get all userProduct IDs to fetch payment details
        const userProductIds = userProducts.map(p => p.id);

        // Fetch payment details
        let paymentDetails: any[] = [];
        try {
            paymentDetails = await prisma.paymentDetails.findMany({
                where: {
                    OR: [
                        { item_product_id: { in: userProductIds } },
                        { userId: { in: userIds } }
                    ]
                }
            });
        } catch (error) {
            console.error("Error fetching payment details:", error);
        }

        const matchedData = users
            .map((user) => {
                // Get latest address for this user
                const userAddresses = addresses.filter(addr => addr.userId === user.id);
                const latestAddress = userAddresses[0];

                const products = userProducts
                    .filter((product) => product.userId?.toString() === user.id.toString())
                    .map((product) => {
                        // Enhanced payment matching for cart items
                        const productPayment = paymentDetails.find(payment => {
                            // Direct match by item_product_id
                            if (payment.item_product_id === product.id) {
                                return true;
                            }
                            
                            // For cart items: match by userId if no specific item_product_id
                            if (payment.userId === user.id && !payment.item_product_id) {
                                return true;
                            }
                            
                            // Additional check: if productId matches the payment reference
                            if (product.productId && payment.item_product_id === product.productId) {
                                return true;
                            }
                            
                            return false;
                        });
                        
                     
                        // First try to find address by product.id (for cart items)
                        let productAddress = addresses.find(addr => addr.product_id === product.id);
                        
                        // Fallback: Try to find by productId (for backward compatibility)
                        if (!productAddress && product.productId && typeof product.productId === 'string' && product.productId.length > 20) {
                            productAddress = addresses.find(addr => addr.id === product.productId);
                        }
                        
                        // Final fallback: Use latest user address
                        if (!productAddress) {
                            productAddress = latestAddress;
                        }

                        return {
                            id: product.id,
                            productname: product.product_name || "Unknown Product",
                            productprice: product.user_product_price || 0,
                            productaddress: productAddress?.streetAddress || "Address not available",
                            productdeliverystatus: product.product_delivery_status,
                            productId: product.productId,
                            item_unit_price: product.user_product_unit_total || product.user_product_price || 0,
                            cart_count: product.user_product_cart_count || 1,
                            isorderConfirmbyUser: product.isorderConfirmbyUser || false,
                            paymentStatus: productPayment?.paymentStatus || "N/A",
                            paymentMethod: productPayment?.paymentMethod || "N/A",
                            shippingDetails: productAddress
                                ? {
                                    phoneNumber: productAddress.phoneNumber,
                                    city: productAddress.city,
                                    state: productAddress.state,
                                    pinCode: productAddress.pinCode,
                                    streetAddress: productAddress.streetAddress,
                                }
                                : null,
                            paymentDetails: productPayment
                                ? {
                                    amount: productPayment.amount,
                                    paymentMethod: productPayment.paymentMethod,
                                    paymentStatus: productPayment.paymentStatus,
                                    transactionId: productPayment.transactionId,
                                    createdAt: productPayment.createdAt,
                                }
                                : null,
                        };
                    });

                return {
                    username: user.name || "Unknown User",
                    userphone: user.phone || null,
                    products,
                };
            })
            .filter(user => user.products.length > 0); // Only return users with products

        return new Response(JSON.stringify({
            success: true,
            data: matchedData,
            message: "User products fetched successfully"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error in users_with_prod_details:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Failed to fetch user products",
            error: error instanceof Error ? error.message : "Unknown error"
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
