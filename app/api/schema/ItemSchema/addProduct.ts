import * as z from "zod";

export const addProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Product description is required"),
    price: z.number().positive("Price must be a positive number"),
    category: z.string().min(1, "Category is required"),
    stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
    imageUrl: z.string().url("Invalid image URL").optional(),
});