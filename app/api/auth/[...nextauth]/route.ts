// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

// 🎯 NextAuth v5 တွင် handlers ကို တစ်ခါတည်း ဆွဲထုတ်ပြီး Export လုပ်ရပါသည်
export const { handlers, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) return null

                const isPasswordCorrect = await bcrypt.compare(credentials.password as string, user.password)
                if (!isPasswordCorrect) return null

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                }
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "your_super_secret_fallback_string_here",
})

// ⚠️ Next.js Route Handler အတွက် GET နှင့် POST ကို အခုလို အတိအကျ ထုတ်ပေးပါ
export const GET = handlers.GET
export const POST = handlers.POST