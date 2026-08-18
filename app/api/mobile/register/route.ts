import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from '@/lib/tokens'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, name } = body

        // ၁။ Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 }
            )
        }

        // ၂။ Email ရှိပြီးသားလား စစ်ဆေးခြင်း
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "This email is already registered" },
                { status: 400 }
            )
        }

        // ၃။ Password hash လုပ်ပြီး User အသစ်ဖန်တီးခြင်း
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: {
                email,
                name: name || null,
                password: hashedPassword,
                role: 'CUSTOMER',
            }
        })

        // ၄။ JWT Tokens ချက်ချင်းထုတ်ပေးခြင်း (Register ပြီးရင် Login ထပ်လုပ်စရာမလို)
        const accessToken = generateAccessToken({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            branchId: newUser.branchId
        })
        const refreshToken = generateRefreshToken({ id: newUser.id })

        // ၅။ Refresh Token ကို User record ထဲသိမ်းခြင်း (7 ရက်)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await prisma.user.update({
            where: { id: newUser.id },
            data: {
                refreshToken,
                refreshTokenExpires: expiresAt,
                refreshTokenRevoked: false
            }
        })

        return NextResponse.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            }
        }, { status: 201 })

    } catch (error) {
        console.error("Mobile Register API Error:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
