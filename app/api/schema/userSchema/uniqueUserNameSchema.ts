import * as z from "zod";


export const uniqueUsernameSchema = z.object({
    username: z.string()
    .min(1, "Username is required")
    .max(20, "Username must be at most 20 characters long")

    .regex(/^[a-zA-Z0-9_]+$/, 
     {message:"Username can only contain letters, numbers, and underscores"})
    
})