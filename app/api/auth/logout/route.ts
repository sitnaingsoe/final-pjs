import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const refreshTokenCookie = cookieStore.get('refreshToken')

        if (refreshTokenCookie && refreshTokenCookie.value) {
            const tokenValue = refreshTokenCookie.value

            // Revoke on User
            await prisma.user.updateMany({
                where: { refreshToken: tokenValue },
                data: {
                    refreshTokenRevoked: true
                }
            })
        }

        // Clear all auth and session cookies thoroughly
        const cookieNames = [
            'refreshToken',
            'authjs.session-token',
            '__Secure-authjs.session-token',
            'next-auth.session-token',
            '__Secure-next-auth.session-token',
            'authjs.callback-url',
            'next-auth.callback-url',
            'authjs.csrf-token',
            'next-auth.csrf-token',
        ]

        cookieNames.forEach((name) => {
            cookieStore.set({
                name,
                value: '',
                path: '/',
                maxAge: 0,
                expires: new Date(0),
            })
        })

        return NextResponse.json(
            { success: true },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        )

    } catch (error) {
        console.error("Logout API Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
