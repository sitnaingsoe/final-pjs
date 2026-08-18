import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireMobileAuth, isAuthError } from '@/lib/auth-mobile'

// GET: User profile ကိုယူခြင်း
export async function GET(request: Request) {
    const authResult = requireMobileAuth(request)
    if (isAuthError(authResult)) return authResult
    const payload = authResult

    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: user })
    } catch (error) {
        console.error("Profile GET Error:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

// PUT: User profile ကို update လုပ်ခြင်း
export async function PUT(request: Request) {
    const authResult = requireMobileAuth(request)
    if (isAuthError(authResult)) return authResult
    const payload = authResult

    try {
        const body = await request.json()
        const { name } = body

        const updatedUser = await prisma.user.update({
            where: { id: payload.id },
            data: { name: name || undefined },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
            }
        })

        return NextResponse.json({ success: true, data: updatedUser })
    } catch (error) {
        console.error("Profile PUT Error:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
