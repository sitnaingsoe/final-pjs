// middleware.ts (Root folder ထဲတွင် ထားရှိရပါမည်)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    // Session Token ကို Cookie ထဲမှ တိုက်ရိုက်ဆွဲထုတ်ခြင်း
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    })

    // အကောင့်ဝင်မထားပါက /login သို့ အတင်းမောင်းထုတ်မည်
    if (!token) {
        const loginUrl = new URL("/login", req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

// 🛡️ ကာကွယ်ထားမည့် Dashboard စာမျက်နှာလမ်းကြောင်းများ
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