import { z } from "zod";

export const buyproductSchema = z.object({
  user: z
  .string()
  .min(1, "User is required"),
  product_name: z.string().min(1, "Product name is required"),
  user_product_description: z
    .string()
    .min(1, "Product description is required"),
  user_product_price: z
    .number()
    .min(0, "Product price must be a positive number"),
  user_product_category: z.enum(
    [
      "electronics",
      "clothing",
      "home",
      "books",
      "toys",
      "sports",
      "beauty",
      "automotive",
      "music",
      "gaming",
      "health",
    ],
    {
      message: "{VALUE} is not a valid category",
    }
  ),


  user_product_item_id: z.string().min(1, "Item ID is required"),
  user_cart_count: z
    .number()
    .int()
    .nonnegative("Cart count must be a non-negative integer")
    .optional(),
});
