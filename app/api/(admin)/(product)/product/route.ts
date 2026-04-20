import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";




export async function GET(request: Request) {

    try {
        const user = await getServerSession(authOptions)
        console.log("Session User:", user);
        
        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }
   
        const data = await prisma.item.findMany()
        return NextResponse.json(data); 
        
    } catch (error) {
        console.error("Error fetching items:", error);  
        return NextResponse.json({ message: error, success: false }, { status: 500 }); 
    }
}   
