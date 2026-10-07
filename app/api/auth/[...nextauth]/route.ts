import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Cari user berdasarkan username
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          // Jika user tidak ditemukan
          if (!user) {
            return null;
          }

          // Verifikasi password menggunakan bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // Jika password tidak cocok
          if (!isPasswordValid) {
            return null;
          }

          // Return user data jika autentikasi berhasil
          return {
            id: user.id,
            name: user.username,
            email: user.username, // NextAuth butuh email, pakai username sebagai fallback
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/', // Redirect ke halaman login utama
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
