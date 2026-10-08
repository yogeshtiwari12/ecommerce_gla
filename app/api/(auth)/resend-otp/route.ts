import { prisma } from "@/app/lib/prisma";
import { sendVerificationEmail } from "../../component/verifyemail";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    const trimmedEmail = email ? decodeURIComponent(email).trim() : null;
    const decodedName = name ? decodeURIComponent(name).trim() : null;

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

    if (!user && decodedName) {
      user = await prisma.user.findFirst({
        where: { name: decodedName },
      });
    }

    if (!user) {
      return Response.json(
        { success: false, message: "User not found with this email" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return Response.json({
        success: false,
        message: "User is already verified. Please sign in.",
      });
    }

    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: verifycode,
        verifyCodeExpiry: new Date(Date.now() + 3600000), // 1 hour expiry
      },
    });

    await sendVerificationEmail(user.name, verifycode, user.email);

    return Response.json({
      success: true,
      message: `Verification OTP has been resent to ${user.email}`,
    });
  } catch (error: any) {
    console.error("Error in resend OTP:", error);
    return Response.json(
      {
        success: false,
        message: `Failed to resend OTP: ${error?.message || "Internal server error"}`,
      },
      { status: 500 }
    );
  }
}
