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

        // Clear the refresh token cookie
        cookieStore.delete('refreshToken')
        
        // Explicitly clear NextAuth session cookies as well to prevent production bugs
        cookieStore.delete('authjs.session-token')
        cookieStore.delete('__Secure-authjs.session-token')
        cookieStore.delete('next-auth.session-token')
        cookieStore.delete('__Secure-next-auth.session-token')

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Logout API Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
