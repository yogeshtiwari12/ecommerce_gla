import { prisma } from "@/app/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: Request,
  context: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await context.params;
    const { name, description, price, category, imageUrl, stock, reason } = await request.json();

    if (!pid) {
      return Response.json(
        { message: "Product ID is required", success: false },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.item.findUnique({ where: { id: pid } });
    if (!existingProduct) {
      return Response.json(
        { message: "Product not found", success: false },
        { status: 404 }
      );
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedStock)) {
      return Response.json(
        { message: "Price and stock must be valid numbers", success: false },
        { status: 400 }
      );
    }

    let nextImageUrl = existingProduct.imageUrl;
    if (typeof imageUrl === "string" && imageUrl.trim()) {
      if (imageUrl.startsWith("data:image")) {
        const uploadResult = await cloudinary.uploader.upload(imageUrl, {
          folder: "products",
        });
        nextImageUrl = uploadResult.secure_url;
      } else {
        nextImageUrl = imageUrl;
      }
    }

    const updatedProduct = await prisma.item.update({
      where: { id: pid },
      data: {
        name: name?.trim() || existingProduct.name,
        description: description?.trim() || existingProduct.description,
        price: Math.trunc(parsedPrice),
        category: category?.trim() || existingProduct.category,
        imageUrl: nextImageUrl,
        stock: Math.trunc(parsedStock),
        reason: typeof reason === "string" ? reason.trim() || null : existingProduct.reason,
      },
    });

    return Response.json(
      {
        message: "Product updated successfully",
        success: true,
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
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
