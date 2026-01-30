import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import prisma from "@/app/lib/prisma";
import {prisma} from "@/app/lib/prisma";

export const authOptions: NextAuthOptions = {

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
        employeeId: { label: "Employee ID", type: "text" },
      },
      async authorize(credentials: any): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email
            }
          })
          if (!user) {
            throw new Error("Invalid Credentials");
          }

          const allowedRoles = ['user', 'delivery_agent', 'admin'];
          if (!allowedRoles.includes(user.role)) {
            throw new Error("Access denied: not a valid user or employee");
          }


          if (user.role !== 'user') {
            if (!credentials.employeeId) {
              throw new Error("Employee ID required for employees/admins");
            }
            if (credentials.employeeId !== user.employeeId) {
              throw new Error("Incorrect Employee ID");
            }
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!passwordMatch) {
            throw new Error("Invalid email or password");
          }
          return user;

        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const now = Math.floor(Date.now() / 1000);

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
        token.iat = now;
        token.exp = now + (24 * 60 * 60); 
        token.lastActivity = now; 
      }


      if (trigger === "update" || !token.lastActivity) {
        token.lastActivity = now;
      }


      if (token.exp && typeof token.exp === 'number' && now >= token.exp) {
        throw new Error("Token expired");
      }

      return token;
    },
    async session({ session, token }) {
      const now = Math.floor(Date.now() / 1000);


      if (token.exp && typeof token.exp === 'number' && now >= token.exp) {
        throw new Error("Session expired");
      }

      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;

      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - industry standard for e-commerce
    updateAge: 2 * 60 * 60, // Refresh every 2 hours for active users
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours - matches session duration
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    throw new Error("NEXTAUTH_SECRET is not set in environment variables");
  })(),
};


