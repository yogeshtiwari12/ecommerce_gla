

import { prisma } from "@/app/lib/prisma";
import { uniqueUsernameSchema } from "../schema/userSchema/uniqueUserNameSchema";

export async function GET(request: Request) {
  try {
    // await connectDb();
    const { searchParams } = new URL(request.url);

    const queryParams = {
      username: searchParams.get("username"),
    };

    const result = uniqueUsernameSchema.safeParse(queryParams);
    if (!result.success) {
      const usernameError =
        result.error.format().username?._errors?.[0] || "Invalid username";

      return Response.json({
        success: false,
        message: usernameError?.length > 0 ? usernameError : "Invalid username",
      });
    }

    const { username } = result.data;

   const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });


    if(!user){
        return Response.json({
          success: false,
          message:"Username is available",
        });
    }

    return Response.json({
      success: true,
      message: "Username is already taken",
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: `Error checking username: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}