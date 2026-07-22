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

        // Clear the cookie
        const response = NextResponse.json({ success: true })
        response.cookies.set({
            name: 'refreshToken',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            expires: new Date(0) // immediately expire
        })

        return response

    } catch (error) {
        console.error("Logout API Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
