import { z } from "zod";

export const cartSchema = z.object({
  user: z
  .string()
  .min(1, "User is required"),
  product_name: z
  .string()
  .min(1, "Product name is required"),
  user_product_description: z
    .string()
    .min(1, "Product description is required"),
  user_product_price: z
    .number()
    .min(0, "Product price must be a positive number"),
  userid: z
  .string()
  .optional(),
  iscancelled:z.
    boolean()
    .default(false),
  isdelivered:z.
    boolean()
    .default(false),
   user_cart_count: z
    .number()
    .int(),

    
  
  
});
