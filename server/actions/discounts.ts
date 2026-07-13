// server/actions/discounts.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from "@/auth"

// ၁။ ရှိသမျှ Discount အားလုံးကို ဆွဲထုတ်ယူခြင်း
export async function getDiscounts() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    try {
        const discounts = await prisma.discount.findMany({
            where: { branchId: session.user.branchId },
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
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

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
                isActive: true,
                branchId: session.user.branchId
            }
        })
        revalidatePath('/dashboard/store/discounts')
        return { success: true }
    } catch (error) {
        console.error("Error creating discount:", error)
        return { success: false, error: "Discount အသစ် ဆောက်၍ မရပါ" }
    }
}

// ၃။ Discount တစ်ခုကို ပိတ်ခြင်း/ဖွင့်ခြင်း (Toggle Active Status)
export async function toggleDiscountStatus(id: string, currentStatus: boolean) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.discount.update({
            where: { id, branchId: session.user.branchId },
            data: { isActive: !currentStatus }
        })
        revalidatePath('/dashboard/store/discounts')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "အခြေအနေ ပြောင်းလဲ၍မရပါ" }
    }
}

// ၄။ လျှော့စျေးကို ဖျက်ပစ်ခြင်း
export async function deleteDiscount(id: string) {
    const session = await auth()
    if (!session?.user?.branchId || session.user.role === 'STAFF') {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const discount = await prisma.discount.findUnique({ where: { id } })
        if (!discount || discount.branchId !== session.user.branchId) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.discount.delete({ where: { id } })

        revalidatePath('/dashboard/store/discounts')
        revalidatePath('/dashboard/store/menu')
        revalidatePath('/pos')
        return { success: true }
    } catch (error) {
        console.error("Error deleting discount:", error)
        return { success: false, error: "ဤလျှော့စျေးကို ဖျက်၍မရပါ။ အခြားနေရာများတွင် အသုံးပြုထားခြင်း ရှိ/မရှိ စစ်ဆေးပါ။" }
    }
}