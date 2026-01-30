import { getAuthSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";


export async function GET(request: Request) {
    try {

        const session = await getAuthSession();

        if (!session) {
            return Response.json(
                { message: "Session Error", success: false },
                { status: 401 }
            );
        }

        // const session = { user: { id: "be50d234-04f6-4c0c-9b06-a462afd220c8" } }; // Mock session for testing   
        
        const userprofile = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                phone: true,
                employeeId: true,
                verifyCodeExpiry: true

            }
        });
        
        const user_shop_data = await prisma.userProduct.findMany({
            where: { userId: session.user.id },
        });

        const addresses = await prisma.shippingAddress.findMany({
            where: { userId: session.user.id }
        });
        console.log("Fetched addresses:", addresses.length);    

        const user_shop_data_with_address = user_shop_data.map((product) => {
            const address = addresses.find(
                (addr) => addr.product_id === product.id
            );
            
            const fallbackAddress = !address ? addresses.find(
                (addr) => addr.product_id === product.productId
            ) : null;
            
            const finalAddress = address || fallbackAddress;
            
            console.log(`Product ${product.id}: Found address: ${finalAddress ? finalAddress.id : 'none'}`);
            
            return { ...product, shippingAddress: finalAddress || null };
        });
        

        return Response.json(
            {
                message: "Profile retrieved successfully",
                success: true,
                user: userprofile,
                user_shop_data: user_shop_data_with_address,
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                message: "Failed to retrieve profile",
                error: (error as Error).message,
                success: false,
            },
            { status: 500 }
        );
    }
}