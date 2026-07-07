// next-auth.d.ts (Project Root Level)
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        role?: string
        branchId?: string | null
    }
    interface Session {
        user: {
            role?: string
            branchId?: string | null
        } & DefaultSession["user"]
    }
}