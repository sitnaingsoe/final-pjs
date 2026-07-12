// server/actions/menu.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getMenuItems() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, data: [] }

    try {
        const data = await prisma.menuItem.findMany({
            where: { category: { branchId: session.user.branchId } },
            include: {
                category: { select: { name: true } },
                addonCategories: { include: { addonCategory: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data }
    } catch (error) {
        return { success: false, data: [] }
    }
}

// ၂။ မီနူးအသစ်ဆောက်ခြင်း (Addon Categories ချိတ်ဆက်မှုပါဝင်သည်)
export async function createMenuItem(formData: FormData, selectedAddonCatIds: string[]) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string
    const description = formData.get('description') as string

    if (!name || isNaN(price) || !categoryId) {
        return { success: false, error: "လိုအပ်သော အချက်အလက်များ အားလုံး ဖြည့်စွက်ပါ" }
    }

    try {
        // Verify category belongs to branch
        const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } })
        if (!category || category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        await prisma.menuItem.create({
            data: {
                name,
                price,
                categoryId,
                description,
                addonCategories: {
                    create: selectedAddonCatIds.map(addonCategoryId => ({
                        addonCategory: { connect: { id: addonCategoryId } }
                    }))
                }
            }
        })
        revalidatePath('/dashboard/store/menu')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "မီနူးအသစ်ထည့်သွင်းခြင်း မအောင်မြင်ပါ" }
    }
}

// ၃။ မီနူး ပြင်ဆင်ခြင်း (Update)
export async function updateMenuItem(id: string, formData: FormData, selectedAddonCatIds: string[]) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string
    const description = formData.get('description') as string

    if (!name || isNaN(price) || !categoryId) {
        return { success: false, error: "လိုအပ်သော အချက်အလက်များ အားလုံး ဖြည့်စွက်ပါ" }
    }

    try {
        // Verify category belongs to branch
        const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } })
        if (!category || category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        // Verify menuItem belongs to branch
        const menuItem = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } })
        if (!menuItem || menuItem.category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        // ရှိပြီးသား Addon ချိတ်ဆက်မှုဟောင်းများကို အရင်ဖြတ်တောက်သည်
        await prisma.menuItemAddonCategory.deleteMany({ where: { menuItemId: id } })

        // အချက်အလက်အသစ်များနှင့် Addon အသစ်များကို အစားထိုးပြင်ဆင်သည်
        await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                price,
                categoryId,
                description,
                addonCategories: {
                    create: selectedAddonCatIds.map(addonCategoryId => ({
                        addonCategory: { connect: { id: addonCategoryId } }
                    }))
                }
            }
        })
        revalidatePath('/dashboard/store/menu')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ခြင်း မအောင်မြင်ပါ" }
    }
}

// ၄။ မီနူး ဖျက်ဆီးခြင်း
export async function deleteMenuItem(id: string) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    try {
        const menuItem = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } })
        if (!menuItem || menuItem.category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        await prisma.menuItem.delete({ where: { id } })
        revalidatePath('/dashboard/store/menu')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ဖျက်ဆီးခြင်း မအောင်မြင်ပါ" }
    }
}

// ၅။ Addon Categories အားလုံး ဆွဲထုတ်ရန် (Helper)
export async function getAddonCategories() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, data: [] }

    try {
        const data = await prisma.addonCategory.findMany({
            where: { branchId: session.user.branchId },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data }
    } catch (error) {
        return { success: false, data: [] }
    }
}