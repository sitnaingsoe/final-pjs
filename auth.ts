// auth.ts (Project Root Level တွင် ဆောက်ပါ)
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    callbacks: {
        // ၁။ JWT Token ထဲသို့ Role နှင့် BranchId ထည့်ခြင်း
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.branchId = user.branchId
            }
            // 🔥 Token ကို Access လုပ်တိုင်း Database မှာ Active ဖြစ်/မဖြစ် စစ်ဆေးမည်
            if (token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: parseInt(token.sub) },
                    select: { isActive: true }
                })
                // Active မဖြစ်တော့ရင် token ကို ဖျက်ပစ်မည် (Logout ဖြစ်သွားမည်)
                if (dbUser && !dbUser.isActive) {
                    return {} as any
                }
            }
            return token
        },
        // ၂။ Frontend Session ထဲသို့ Role နှင့် BranchId လွှဲပြောင်းပေးခြင်း
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string
                session.user.role = token.role as string
                session.user.branchId = token.branchId as string
            }
            return session
        }
    },
    pages: {
        signIn: "/login", // Default Sign-in page ကို ကိုယ့်စာမျက်နှာဆီ ညွှန်းခြင်း
    },
    secret: process.env.NEXTAUTH_SECRET,
})