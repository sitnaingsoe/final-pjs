// middleware.ts (Root Folder တွင်ရှိသောဖိုင်)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    // 🔐 NextAuth ရဲ့ Session Token ကို ဒေတာဘေ့စ်မခေါ်ဘဲ Cookie ထဲကနေ တိုက်ရိုက်ဆွဲထုတ်ခြင်း
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET || "your_super_secret_fallback_string_here"
    })

    // 🚫 Token (Session) မရှိပါက /login UI ဆီသို့ ချက်ချင်းမောင်းထုတ်မည်
    if (!token) {
        const loginUrl = new URL("/login", req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

// 🎯 ကာကွယ်လိုသော Dashboard လမ်းကြောင်းများ (ဒီလမ်းကြောင်းတွေပဲ Middleware ဖြတ်မည်)
export const config = {
    matcher: [
        "/orders/:path*",
        "/menu/:path*",
        "/tables/:path*",
        "/categories/:path*",
        "/settings/:path*",
        "/discounts/:path*",
    ],
}