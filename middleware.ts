// middleware.ts (Root folder ထဲတွင် ထားရှိရပါမည်)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    // Session Token ကို Cookie ထဲမှ တိုက်ရိုက်ဆွဲထုတ်ခြင်း
    const isProd = process.env.NODE_ENV === "production";
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: isProd,
        salt: isProd ? "__Secure-authjs.session-token" : "authjs.session-token"
    })

    const refreshToken = req.cookies.get("refreshToken")?.value;

    // အကောင့်ဝင်မထားပါက /login သို့ အတင်းမောင်းထုတ်မည် (NextAuth token သို့မဟုတ် Custom Refresh Token နှစ်ခုလုံးမရှိလျှင်)
    if (!token && !refreshToken) {
        const loginUrl = new URL("/login", req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path*", // 🎯 /dashboard အောက်က page မှန်သမျှကို Middleware ဖြင့် လုံခြုံရေးစစ်မည်
    ],
}