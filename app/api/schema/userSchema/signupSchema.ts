import * as z from "zod";

export const signupSchema = z.object({
  name: z.
  string()
  .min(1, "Name is required"),


  email: z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required"),


  password: z
  .string()
  .min(6, "Password must be at least 6 characters long"),

  role: z
  .enum(["user", "admin"])
  .default("user"),
});