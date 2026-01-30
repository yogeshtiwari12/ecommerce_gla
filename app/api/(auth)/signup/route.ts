import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../../component/verifyemail";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
    });

    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
    const haspass = await bcrypt.hash(password, 10);

    // CASE 1: user exists AND is verified → reject
    if (existingUser && existingUser.isVerified) {
      return Response.json(
        { success: false, message: "User already Exists With this email" },
        { status: 400 }
      );
    }

    if (existingUser && !existingUser.isVerified) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: haspass,
          otp: verifycode,
          verifyCodeExpiry: new Date(Date.now() + 3600000),
        },
      });
    }

    // CASE 3: new user → create
    if (!existingUser) {
      await prisma.user.create({
        data: {
          name,
          email,
          otp: verifycode,
          password: haspass,
          verifyCodeExpiry: new Date(Date.now() + 3600000),
          role,
        },
      });
    }

    await sendVerificationEmail(name, verifycode, email);

    return Response.json(
      {
        message: "User created successfully. Check your email for verification.",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal Server Error",error: error  },
      { status: 500 }
    );
  }
}
