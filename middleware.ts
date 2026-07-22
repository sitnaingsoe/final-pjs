// middleware.ts (Root folder ထဲတွင် ထားရှိရပါမည်)
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth;

    // အကောင့်ဝင်မထားပါက /login သို့ အတင်းမောင်းထုတ်မည်
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl)
        return Response.redirect(loginUrl)
    }
})

export const config = {
    matcher: [
        "/dashboard/:path*", // 🎯 /dashboard အောက်က page မှန်သမျှကို Middleware ဖြင့် လုံခြုံရေးစစ်မည်
    ],
}