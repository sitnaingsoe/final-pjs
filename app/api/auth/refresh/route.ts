import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/tokens'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const refreshTokenCookie = cookieStore.get('refreshToken')

        // Mobile fallback: refresh token ကို request body ထဲကလည်း ဖတ်နိုင်သည်
        let tokenValue = refreshTokenCookie?.value || null

        if (!tokenValue) {
            try {
                const body = await request.json()
                tokenValue = body?.refreshToken || null
            } catch {
                // Body parsing fail ဖြစ်ရင် ဆက်သွားမည်
            }
        }

        if (!tokenValue) {
            return NextResponse.json({ success: false, error: "No refresh token provided" }, { status: 401 })
        }

        // Verify JWT signature and expiration
        const payload = verifyRefreshToken(tokenValue)
        if (!payload) {
            return NextResponse.json({ success: false, error: "Invalid or expired refresh token" }, { status: 403 })
        }

        // Fetch user by refresh token to ensure it exists and is not revoked
        const user = await prisma.user.findUnique({
            where: { refreshToken: tokenValue }
        })

        if (!user || user.refreshTokenRevoked || !user.isActive || !user.refreshTokenExpires || new Date() > user.refreshTokenExpires) {
            return NextResponse.json({ success: false, error: "Token invalid, expired, or user disabled" }, { status: 403 })
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branchId
        })

        const newRefreshToken = generateRefreshToken({ id: user.id })
        
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)
        
        // Update user's refresh token directly (Token Rotation)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: newRefreshToken,
                refreshTokenExpires: expiresAt,
                refreshTokenRevoked: false
            }
        })

        const response = NextResponse.json({
            success: true,
            accessToken: newAccessToken
        })

        // Set the new refresh token cookie
        response.cookies.set({
            name: 'refreshToken',
            value: newRefreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: expiresAt
        })

        return response

    } catch (error) {
        console.error("Refresh API Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
