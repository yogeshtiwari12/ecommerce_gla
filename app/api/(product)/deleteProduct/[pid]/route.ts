
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(request: Request,
  context: { params: Promise<{ pid: string }> }
) {
    try {
        
        const {pid} = await context.params;
        
        if (!pid) {
            return Response.json({
                message: "Product ID is required",
                success: false
            }, { status: 400 });
        }

        const sesseion = await getServerSession(authOptions);
        if (!sesseion) {
            return Response.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 });
        }
          const deletedProduct = await prisma.userProduct.delete({
            where: { id: pid }
          });
     
        if (!deletedProduct) {
            return Response.json({
                message: "Product not found",
                success: false
            }, { status: 404 });
        }
        
        return Response.json({
            message: "Product deleted successfully",
            success: true,
            deletedProduct
        }, { status: 200 });
    } 
    catch (error) {
        console.error("Error deleting product:", error);
        
        return Response.json({
            message: "Failed to delete product",
            error: (error as Error).message,
            success: false
        }, { status: 500 });
    }   
}

