// middleware.ts (Root folder ထဲတွင် ထားရှိရပါမည်)
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth;

    // အကောင့်ဝင်မထားပါက /login သို့ အတင်းမောင်းထုတ်မည်
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        "/dashboard/:path*", // 🎯 /dashboard အောက်က page မှန်သမျှကို Middleware ဖြင့် လုံခြုံရေးစစ်မည်
    ],
}