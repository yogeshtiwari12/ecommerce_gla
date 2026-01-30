import { prisma } from "@/app/lib/prisma";


export async function POST(request: Request) {
  const { name, otp } = await request.json();

  try {
    // await connectDb();

    const decodedusername = decodeURIComponent(name);

    const user = await prisma.user.findFirst({
      where:{name:decodedusername}
    }

    );

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

