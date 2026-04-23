import { NextResponse as Response } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from "@/app/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { name, description, price, category, imageUrl, stock, reason } = await request.json();

    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      price === null ||
      !category?.trim() ||
      !imageUrl?.trim() ||
      stock === undefined ||
      stock === null
    ) {
      return Response.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedStock)) {
      return Response.json({ success: false, message: "Price and stock must be valid numbers" }, { status: 400 });
    }

    const existingProduct = await prisma.item.findFirst({ where: { name } });

    if (existingProduct) {
      return Response.json({ success: false, message: "Product already exists" }, { status: 409 });
    }

    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: 'products'
    });

    const newProduct = await prisma.item.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: Math.trunc(parsedPrice),
        category: category.trim(),
        imageUrl: uploadResult.secure_url,
        stock: Math.trunc(parsedStock),
        reason: reason?.trim() || null,
      }             
    });


    return Response.json({
      success: true,
      message: "Product added successfully",
      product: newProduct
    }, { status: 201 });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      success: false,
      message: "Failed to add product"
    }, { status: 500 });
  }
}