import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";

// 2nd page  employee data route 
export async function GET(request: Request) {
    const user = await getServerSession(authOptions);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }
    try {
        const employees = await prisma.user.findMany({
        where:{
            role: {
                in: ["delivery_agent", "admin"]
            },       
        },
     
        })
        return NextResponse.json(employees);    

    } catch (error) {
        console.error("Error fetching employees:", error);          
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });  

    }
}