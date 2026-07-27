'use server'

import { prisma } from '@/lib/db'

export async function validatePromoCode(code: string, branchId: string, cartTotal: number) {
    if (!code) return { success: false, error: "ပရိုမိုကုဒ် ထည့်သွင်းပါ" }

    try {
        const promo = await prisma.promoCode.findUnique({
            where: { code }
        })

        if (!promo) {
            return { success: false, error: "ပရိုမိုကုဒ် မှားယွင်းနေပါသည်" }
        }

        if (promo.branchId !== branchId) {
            return { success: false, error: "ဤကုဒ်ကို အခြားဆိုင်ခွဲတွင်သာ အသုံးပြုနိုင်ပါသည်" }
        }

        if (!promo.isActive) {
            return { success: false, error: "ဤကုဒ်မှာ ပိတ်ထားပါသည်" }
        }

        if (promo.expiryDate && new Date() > promo.expiryDate) {
            return { success: false, error: "ပရိုမိုကုဒ် သက်တမ်းကုန်သွားပါပြီ" }
        }

        if (promo.maxUsageLimit && promo.usedCount >= promo.maxUsageLimit) {
            return { success: false, error: "ဤကုဒ် အသုံးပြုခွင့် အရေအတွက် ပြည့်သွားပါပြီ" }
        }

        if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
            return { success: false, error: `အနည်းဆုံး ${promo.minOrderAmount} ဖိုး ဝယ်ယူရန် လိုအပ်ပါသည်` }
        }

        // Calculate discount
        let discountAmount = 0
        if (promo.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * promo.discountValue) / 100
        } else {
            discountAmount = promo.discountValue
        }

        // Ensure discount doesn't exceed cart total
        discountAmount = Math.min(discountAmount, cartTotal)

        return { 
            success: true, 
            discountAmount, 
            promoId: promo.id,
            discountType: promo.discountType,
            discountValue: promo.discountValue
        }
    } catch (error) {
        console.error("Error validating promo code:", error)
        return { success: false, error: "စနစ်ချို့ယွင်းမှုဖြစ်နေပါသည်" }
    }
}

export async function createPromoCode(data: any) {
    try {
        await prisma.promoCode.create({
            data: {
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                discountValue: Number(data.discountValue),
                minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
                maxUsageLimit: data.maxUsageLimit ? Number(data.maxUsageLimit) : null,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                branchId: data.branchId
            }
        })
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "ကုဒ်ပြုလုပ်ခြင်း မအောင်မြင်ပါ (ကုဒ်တူနေနိုင်ပါသည်)" }
    }
}

export async function togglePromoCode(id: string, isActive: boolean) {
    try {
        await prisma.promoCode.update({
            where: { id },
            data: { isActive }
        })
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function deletePromoCode(id: string) {
    try {
        await prisma.promoCode.delete({ where: { id } })
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
