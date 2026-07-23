import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from '@/lib/tokens'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) {
            return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
        }

        if (!user.isActive) {
            return NextResponse.json({ success: false, error: "Account is disabled" }, { status: 403 })
        }

        // 1. Generate Tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branchId
        })
        
        const refreshToken = generateRefreshToken({ id: user.id })

        // 2. Save Refresh Token to User (expires in 7 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: refreshToken,
                refreshTokenExpires: expiresAt,
                refreshTokenRevoked: false
            }
        })

        // 3. Set Refresh Token as HttpOnly Cookie
        const response = NextResponse.json({
            success: true,
            accessToken, // Frontend will save this in localStorage
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                branchId: user.branchId
            }
        })

        const cookieStore = await cookies()
        cookieStore.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/', // Accessible everywhere
            expires: expiresAt
        })

        return response

    } catch (error) {
        console.error("Login API Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}