import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}
