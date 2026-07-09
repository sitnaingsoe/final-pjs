import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/tokens'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const refreshTokenCookie = cookieStore.get('refreshToken')

        if (!refreshTokenCookie || !refreshTokenCookie.value) {
            return NextResponse.json({ success: false, error: "No refresh token provided" }, { status: 401 })
        }

        const tokenValue = refreshTokenCookie.value

        // Verify JWT signature and expiration
        const payload = verifyRefreshToken(tokenValue)
        if (!payload) {
            return NextResponse.json({ success: false, error: "Invalid or expired refresh token" }, { status: 403 })
        }

        // Check database to ensure the token exists and is not revoked
        const dbToken = await prisma.refreshToken.findUnique({
            where: { token: tokenValue }
        })

        if (!dbToken || dbToken.isRevoked) {
            return NextResponse.json({ success: false, error: "Token revoked or not found" }, { status: 403 })
        }

        // Fetch user to get current data for the access token
        const user = await prisma.user.findUnique({ where: { id: payload.id } })
        if (!user || !user.isActive) {
            return NextResponse.json({ success: false, error: "User not found or disabled" }, { status: 403 })
        }

        // Revoke the old refresh token (Token Rotation for security)
        await prisma.refreshToken.update({
            where: { token: tokenValue },
            data: { isRevoked: true }
        })

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
        
        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                expires: expiresAt
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
            sameSite: 'strict',
            path: '/',
            expires: expiresAt
        })

        return response

    } catch (error) {
        console.error("Refresh API Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
