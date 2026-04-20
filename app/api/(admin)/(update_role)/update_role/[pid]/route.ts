import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";



export async function PATCH(request: Request,
     context : { params: Promise<{ pid: string }> }
) {
    const payload = await request.json();
    const { pid } = await context.params;
    
        
    try {
        const user = await getServerSession(authOptions);
        console.log("Session User:", user);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const allowedKeys = [
            "email",
            "name",
            "phone",
            "password",
            "otp",
            "isVerified",
            "verifyCodeExpiry",
            "employeeId",
            "role",
        ] as const;

        const data = Object.fromEntries(
            Object.entries(payload).filter(
                ([key, value]) => allowedKeys.includes(key as (typeof allowedKeys)[number]) && value !== undefined
            )
        );

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ message: "No valid fields to update", success: false }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: pid },
            data,
        })
        return NextResponse.json({ message: "Updated", success: true, user: updatedUser }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ message, success: false }, { status: 500 });
        

    }
}