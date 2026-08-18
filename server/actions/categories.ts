// server/actions/categories.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { getEffectiveBranchId } from '@/lib/branchContext'

// ၁။ လက်ရှိဆိုင်ခွဲနှင့် သက်ဆိုင်သော အမျိုးအစားများအားလုံး ဆွဲထုတ်ခြင်း
export async function getCategories() {
    const branchId = await getEffectiveBranchId()
    if (!branchId) return { success: false, data: [] }

    try {
        const data = await prisma.menuCategory.findMany({
            where: { branchId },
            include: {
                _count: { select: { menuItems: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data }
    } catch (error) {
        return { success: false, data: [] }
    }
}

// ၂။ အမျိုးအစားအသစ် တည်ဆောက်ခြင်း
export async function createCategory(formData: FormData) {
    const session = await auth()
    const branchId = await getEffectiveBranchId()
    if (!branchId) return { success: false, error: "Authentication လိုအပ်ပါသည်" }
    if (session?.user?.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot perform this action." }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) return { success: false, error: "အမျိုးအစားအမည် ဖြည့်စွက်ပါ" }

    try {
        await prisma.menuCategory.create({
            data: {
                name,
                description,
                branchId
            }
        })
        revalidatePath('/dashboard/store/categories')
        return { success: true }
    } catch (error) {
        return { success: false, error: "အသစ်ဆောက်ရာတွင် အမှားအယွင်း ရှိနေပါသည်" }
    }
}

// ၃။ အမျိုးအစား ပြင်ဆင်ခြင်း (Update)
export async function updateCategory(id: string, formData: FormData) {
    const session = await auth()
    if (session?.user?.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot perform this action." }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) return { success: false, error: "အမျိုးအစားအမည် ဖြည့်စွက်ပါ" }

    try {
        await prisma.menuCategory.update({
            where: { id },
            data: { name, description }
        })
        revalidatePath('/dashboard/categories')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ရာတွင် အမှားအယွင်း ရှိနေပါသည်" }
    }
}

// ၄။ အမျိုးအစား ဖျက်ဆီးခြင်း
export async function deleteCategory(id: string) {
    const session = await auth()
    if (session?.user?.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot perform this action." }

    try {
        await prisma.menuCategory.delete({
            where: { id }
        })
        revalidatePath('/dashboard/categories')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ဤအမျိုးအစားအောက်တွင် ဟင်းပွဲများ ရှိနေသောကြောင့် ဖျက်၍မရပါ" }
    }
}