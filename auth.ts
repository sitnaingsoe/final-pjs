// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) return null

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) return null

                // 🚫 Account disable လုပ်ထားသော user ကို ဝင်ခွင့်မပြုမည်
                if (!user.isActive) return null

                // 🎯 ပြန်ပေးလိုက်သော ဒေတာများသည် JWT Token ထဲသို့ ရောက်သွားမည်
                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    branchId: user.branchId,
                }
            }
        })
    ],
    pages: {
        signIn: "/login", // Default Sign-in page ကို ကိုယ့်စာမျက်နှာဆီ ညွှန်းခြင်း
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
})