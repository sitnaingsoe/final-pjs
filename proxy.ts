import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const refreshToken = req.cookies.get("refreshToken")?.value
    const { pathname } = req.nextUrl

    // 🎯 API routes, Next.js internal routes, and auth pages must NEVER be redirected by middleware
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname === '/login' ||
        pathname === '/register'
    ) {
        return NextResponse.next()
    }

    // အကောင့်ဝင်မထားပါက /login သို့ အတင်းမောင်းထုတ်မည်
    if (!isLoggedIn && !refreshToken) {
        const loginUrl = new URL("/login", req.url)
        return Response.redirect(loginUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
    ],
}