// server/actions/discounts.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ၁။ ရှိသမျှ Discount အားလုံးကို ဆွဲထုတ်ယူခြင်း
export async function getDiscounts() {
    try {
        const discounts = await prisma.discount.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: discounts }
    } catch (error) {
        console.error("Error fetching discounts:", error)
        return { success: false, error: "Discounts စာရင်း ဆွဲထုတ်၍ မရပါ" }
    }
}

// ၂။ Discount ပရိုမိုးရှင်းအသစ် တည်ဆောက်ခြင်း (Create)
export async function createDiscount(formData: FormData) {
    const name = formData.get('name') as string
    const type = formData.get('type') as 'PERCENTAGE' | 'FIXED'
    const valueStr = formData.get('value') as string

    if (!name || !type || !valueStr) {
        return { success: false, error: "အချက်အလက်များ ပြည့်စုံစွာ ဖြည့်သွင်းပါ" }
    }

    try {
        await prisma.discount.create({
            data: {
                name,
                type,
                value: parseFloat(valueStr),
                isActive: true
            }
        })
        revalidatePath('/discounts')
        return { success: true }
    } catch (error) {
        console.error("Error creating discount:", error)
        return { success: false, error: "Discount အသစ် ဆောက်၍ မရပါ" }
    }
}

// ၃။ Discount တစ်ခုကို ပိတ်ခြင်း/ဖွင့်ခြင်း (Toggle Active Status)
export async function toggleDiscountStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.discount.update({
            where: { id },
            data: { isActive: !currentStatus }
        })
        revalidatePath('/discounts')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "အခြေအနေ ပြောင်းလဲ၍မရပါ" }
    }
}