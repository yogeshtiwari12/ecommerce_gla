import { prisma } from "@/app/lib/prisma";


export async function POST(request: Request) {
  try {
    const { name, otp, email } = await request.json();

    const trimmedEmail = email ? decodeURIComponent(email).trim() : null;
    const decodedusername = name ? decodeURIComponent(name).trim() : null;

    let user = null;

    if (trimmedEmail) {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: trimmedEmail,
            mode: "insensitive",
          },
        },
      });
    }

    if (!user && decodedusername) {
      user = await prisma.user.findFirst({
        where: { name: decodedusername },
      });
    }

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      });
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.verifyCodeExpiry ? new Date(user.verifyCodeExpiry) > new Date() : false;


    if (isCodeValid && isNotExpired) {
      user.isVerified = true;

      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      return Response.json({
        success: true,
        message: "User verified successfully",
      });
    } else if (!isNotExpired) {
      return Response.json({
        success: false,
        message: "Verification code expired",
      });
    } else {
      return Response.json({
        success: false,
        message: "Invalid verification code",
      });
    }
  } catch (error) {
    console.error("Error in verify code:", error);
    return Response.json({
      success: false,
      message: `Failed to verify code: ${(error as Error).message}`,
    });
  }
}


