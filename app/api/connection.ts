import { prisma } from "../lib/prisma";

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // Test a simple query
    const users = await prisma.user.findMany();
    console.log("✅ Users fetched successfully:", users);

    // Disconnect after testing
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error testing Prisma connection:", error);
  }
}

testConnection();