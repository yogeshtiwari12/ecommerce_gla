import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function POST(request:Request,
  context: { params: Promise<{ pid: string }> }){

    try {

   const {pid} = await context.params;
   const data  = await request.json();
//    console.log(data);


// const session  = await getServerSession(authOptions);
// if(!session){
//     return Response.json({
//         message: "Session not found",
//         status: 401,
//         success: false,
//     });
// }




console.log("pidp",pid)
await prisma.userProduct.update({
    where: { id: pid },
    data: {
        product_delivery_status: data.product_delivery_status,
        isdelivered: data.product_delivery_status = data.product_delivery_status === "delivered" ? true : false,
    },
});

return NextResponse.json({
    message: "Product updated successfully",
    status: 200,
    success: true,
});

    } catch (error) {
        console.error("Error updating product:", error);
        return Response.json({
            message: "Update failed",
            status: 500,
            success: false,
            error: "Internal Server Error"
        });
    }
}