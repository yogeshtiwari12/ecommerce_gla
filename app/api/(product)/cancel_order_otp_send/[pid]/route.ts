
import { getServerSession } from "next-auth";
import { authOptions } from "../../../(auth)/auth/[...nextauth]/options";
import { sendCancelEmail } from "../../../component/send_cancel_email";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request,
    context : { params:Promise< { pid: string }> }  
) {
    try {
        const { pid } = await context.params;
        console.log("pid = ", pid)

        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({   
                message: "Session Not Found",
                success: false
            }, { status: 401 });
        }


      const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        const iSproductExist = await prisma.userProduct.findFirst({
            where: { productId: pid },
            include: {
                User: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        if(!iSproductExist){
            return Response.json({
                message: "Product Not Found",
                success: false
            }, { status: 404 });
        }



        const userName = iSproductExist.User?.name || session.user.name || "User";
        const userEmail = iSproductExist.User?.email || session.user.email || "";
        
        console.log("Sending OTP to:", userName, userEmail, otp);
        
        await sendCancelEmail(userName, otp, userEmail);

 
     await prisma.userProduct.update({
        where:{
            id: iSproductExist.id 
        },
        data:{
            cancel_order_otp: otp
        } as any
     })
        


        return Response.json({
            message: "OTP sent successfully",
            success: true,
            otp
        }, { status: 200 });

    } catch (error) {
        console.error("Error sending cancel order OTP:", error);
        return Response.json({
            message: "Failed to send OTP",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}