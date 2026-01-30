import { User } from "../../../model/userModel";
import { connectDb } from "../../../route";


export async function DELETE(request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDb();
        
        const productId = await params.id;
        
        if (!productId) {
            return Response.json({
                message: "Product ID is required",
                success: false
            }, { status: 400 });
        }
          const deletedProduct = await User.findByIdAndDelete(productId, { lean: true });
        
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