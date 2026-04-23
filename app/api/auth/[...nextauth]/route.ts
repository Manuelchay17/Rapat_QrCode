import NextAuth, { NextAuthOptions } from "next-auth"; // Tambahkan NextAuthOptions
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 1. Ekstrak konfigurasi ke variabel authOptions dan tambahkan EXPORT
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        });

        if (!admin) {
          throw new Error("Email tidak terdaftar");
        }

        const isMatch = await bcrypt.compare(credentials.password, admin.password);
        
        if (!isMatch) {
          throw new Error("Password salah");
        }

        return { 
          id: admin.id, 
          name: admin.email, 
          email: admin.email 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
};

// 2. Gunakan authOptions di handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };