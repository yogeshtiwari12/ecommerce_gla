// index.ts
// Query your database using the Accelerate Client extension

import { PrismaClient } from '@/generated/prisma/client/client'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate())

