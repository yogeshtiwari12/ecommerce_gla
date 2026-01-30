import * as z from "zod";

export const deleteProduct = z.object({
    item_id: z.string()
        .uuid("Invalid item ID format")
        .min(1, "Item ID is required")
        .max(8, "Item ID must be at most 36 characters long"),
         reason: z.string()
         .min(1, "Reason for deletion is required")


})