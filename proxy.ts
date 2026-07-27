import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const refreshToken = req.cookies.get("refreshToken")?.value
    const { pathname } = req.nextUrl

    // 🎯 Public routes: Scan page, API routes, Next.js assets, and Auth pages must NEVER require login
    if (
        pathname.startsWith('/scan') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password' ||
        pathname === '/reset-password' ||
        pathname === '/'
    ) {
        return NextResponse.next()
    }

    // အကောင့်ဝင်မထားပါက /login သို့ အတင်းမောင်းထုတ်မည် (Dashboard/POS/Kitchen မ်ားအတှကျ)
    if (!isLoggedIn && !refreshToken) {
        const loginUrl = new URL("/login", req.url)
        return Response.redirect(loginUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/pos/:path*",
        "/kitchen/:path*",
    ],
}