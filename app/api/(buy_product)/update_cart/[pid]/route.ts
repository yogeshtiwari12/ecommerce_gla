import { prisma } from "@/app/lib/prisma";


export async function POST(
  request: Request,
  context: { params: Promise<{ pid: string }> }
) {

  try {
    const { pid } = await context.params;


    const data = await request.json();
    const updatedProduct = await prisma.userProduct.update({
      where: { id:pid },
      data,
    });
    if (!updatedProduct) {
      return Response.json(
        { message: "Product not found", success: false },
        { status: 404 }
      );
    }
    

    return Response.json(
      {
        message: "Product updated successfully",
        success: true,
        product: updatedProduct,
      },
      { status: 200 }
    );
  }
   catch (error) {
    console.error("Error updating product:", error);
    return Response.json(
      {
        message: "Failed to update product",
        error: (error as Error).message,
        success: false,
      },
      { status: 500 }
    );
  }
}