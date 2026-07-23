import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    return NextResponse.json({
        env: {
            NODE_ENV: process.env.NODE_ENV,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
            hasAuthSecret: !!process.env.AUTH_SECRET,
            hasAuthTrustHost: !!process.env.AUTH_TRUST_HOST,
            vercelEnv: process.env.VERCEL_ENV,
            vercelUrl: process.env.VERCEL_URL,
        },
        cookies: allCookies.map(c => ({ name: c.name, present: !!c.value })),
    })
}
