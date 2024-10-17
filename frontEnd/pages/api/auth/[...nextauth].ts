import bcrypt from "bcrypt"
import NextAuth, { AuthOptions ,DefaultSession} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// Google and GitHub provider imports removed
import { PrismaAdapter } from "@next-auth/prisma-adapter"


// Extending the session type to include 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

import prisma from "@/app/libs/prismadb"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user?.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return user;
      }
    })
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Ensure that session.user.id is always a string
        session.user.id = token.sub || '';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions);

