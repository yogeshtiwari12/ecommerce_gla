import { getServerSession } from "next-auth";
import { authOptions } from "../../../(auth)/auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ pid: string }> }) {
  try {
    const { pid } = await context.params;
    console.log("PID received for address update:", pid);

    const {
      phoneNumber,
      streetAddress,
      city,
      state,
      pinCode,
    } = await request.json();


    if(phoneNumber.length>10){
        return NextResponse.json({ success: false, error: 'Invalid phone number ' }, { status: 400 });       
    }
        else if(pinCode.length>6){
        return NextResponse.json({ success: false, error: 'Invalid Pincode ' }, { status: 400 });       
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Session Not Found", success: false },
        { status: 401 }
      );
    }

    const updatedAddress = await prisma.shippingAddress.update({
      where: { id: pid }, 
      data: {
        phoneNumber,
        streetAddress,
        city,
        state,
        pinCode,
      },
    });

    return NextResponse.json(
      {
        message: "Address updated successfully",
        success: true,
        data: updatedAddress,
      },
      { status: 200 }
    );
  } catch (error: any) {
  
    console.error("Error updating address:", error);
    return NextResponse.json(
      { message: "Error updating address", success: false },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Session Not Found", success: false },
        { status: 401 }
      );
    }

    const address = await prisma.shippingAddress.findUnique({
      where: { id: pid },
    });

    if (!address) {
      return NextResponse.json(
        { message: "Address not found", success: false },
        { status: 404 }
      );
    }

    if (address.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden: address does not belong to user", success: false },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Address fetched", success: true, data: address },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching address", success: false },
      { status: 500 }
    );
  }
}

