// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "your_super_secret_fallback_string_here",
  pages: {
    signIn: '/login',
  },
  providers: [], // Added in auth.ts to avoid Edge runtime issues
  callbacks: {
    jwt({ token, user }) {
        if (user) {
            token.role = user.role;
            token.branchId = user.branchId;
        }
        return token;
    },
    session({ session, token }) {
        if (session.user) {
            session.user.id = token.sub as string;
            session.user.role = token.role as string;
            session.user.branchId = token.branchId as string;
        }
        return session;
    }
  },
} satisfies NextAuthConfig;
