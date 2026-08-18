import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST: Promo code ကို validate လုပ်ခြင်း (Mobile app အတွက်)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { code, branchId, cartTotal } = body

        if (!code) {
            return NextResponse.json(
                { success: false, error: "Promo code is required" },
                { status: 400 }
            )
        }

        if (!branchId || cartTotal === undefined) {
            return NextResponse.json(
                { success: false, error: "branchId and cartTotal are required" },
                { status: 400 }
            )
        }

        const promo = await prisma.promoCode.findUnique({ where: { code } })

        if (!promo) {
            return NextResponse.json(
                { success: false, error: "Invalid promo code" },
                { status: 404 }
            )
        }

        // ဆိုင်ခွဲ ကိုက်/မကိုက် စစ်ဆေးခြင်း
        if (promo.branchId !== branchId) {
            return NextResponse.json(
                { success: false, error: "This code is not valid for this branch" },
                { status: 400 }
            )
        }

        if (!promo.isActive) {
            return NextResponse.json(
                { success: false, error: "This promo code is inactive" },
                { status: 400 }
            )
        }

        if (promo.expiryDate && new Date() > promo.expiryDate) {
            return NextResponse.json(
                { success: false, error: "This promo code has expired" },
                { status: 400 }
            )
        }

        if (promo.maxUsageLimit && promo.usedCount >= promo.maxUsageLimit) {
            return NextResponse.json(
                { success: false, error: "This promo code has reached its usage limit" },
                { status: 400 }
            )
        }

        if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
            return NextResponse.json(
                { success: false, error: `Minimum order amount is ${promo.minOrderAmount}` },
                { status: 400 }
            )
        }

        // Discount တွက်ခြင်း
        let discountAmount = 0
        if (promo.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * promo.discountValue) / 100
        } else {
            discountAmount = promo.discountValue
        }
        discountAmount = Math.min(discountAmount, cartTotal)

        return NextResponse.json({
            success: true,
            discountAmount,
            promoId: promo.id,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
        })

    } catch (error) {
        console.error("Promo Validate API Error:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
