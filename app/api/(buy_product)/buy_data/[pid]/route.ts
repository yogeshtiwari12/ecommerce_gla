import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(request:Request ,ctx:any) {
    const {pid}  = await ctx.params;  
    
     
    console.log("buy data pid",pid )

    const buy_data =  await prisma.item.findFirst({
        where:{id:pid}
    })

    
    return NextResponse.json({message:"sample data",buy_data:buy_data})


}