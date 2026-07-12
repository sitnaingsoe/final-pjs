// server/actions/addons.ts
'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ၁။ လက်ရှိ ရှိပြီးသား အပိုပစ္စည်းအုပ်စုများနှင့် ၎င်းတို့အောက်ရှိ ပစ္စည်းများကို ဆွဲထုတ်ရန်
export async function getAddonCategories() {
    try {
        const categories = await prisma.addonCategory.findMany({
            include: {
                addons: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error("Error fetching addons:", error)
        return { success: false, error: "ဒေတာဆွဲထုတ်၍ မရပါ" }
    }
}

// ၂။ လက်ရှိ ရှိပြီးသား မီနူးဟင်းပွဲများအားလုံးကို Dropdown Box တွင် ပြရန်အတွက် ဆွဲထုတ်ရန်
export async function getMenuItemsSimple() {
    try {
        const items = await prisma.menuItem.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: items }
    } catch (error) {
        console.error("Error fetching simple menu items:", error)
        return { success: false, data: [] }
    }
}

export async function createAddonCategory(formData: FormData) {
    // 🎯 ၁။ လက်ရှိ login ဝင်ထားသော user ထံမှ branchId ကို ရယူခြင်း
    const session = await auth()
    if (!session?.user?.branchId) {
        return { success: false, error: "Authentication သို့မဟုတ် ဆိုင်ခွဲသတ်မှတ်ချက် လိုအပ်ပါသည်" }
    }

    const name = formData.get('name') as string
    const minSelectStr = formData.get('minSelect') as string
    const maxSelectStr = formData.get('maxSelect') as string

    if (!name) return { success: false, error: "အုပ်စုအမည် လိုအပ်ပါသည်" }

    try {
        await prisma.addonCategory.create({
            data: {
                name,
                minSelect: parseInt(minSelectStr) || 0,
                maxSelect: parseInt(maxSelectStr) || 1,
                branchId: session.user.branchId, // 👈 🎯 ဤနေရာတွင် branchId ကို ထည့်သွင်းပေးလိုက်ခြင်းဖြင့် Error ပျောက်သွားပါမည်
            }
        })
        revalidatePath('/dashboard/store/addons') // လမ်းကြောင်းမှန်အောင် ညွှန်းပေးပါ
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "အုပ်စုအသစ် ဆောက်၍မရပါ" }
    }
}

// ၄။ အုပ်စုတစ်ခုချင်းစီအောက်သို့ အပိုပစ္စည်းအမှန်တကယ် ထည့်သွင်းခြင်း (Addon Create)
export async function createAddon(formData: FormData) {
    const name = formData.get('name') as string
    const priceStr = formData.get('price') as string
    const addonCategoryId = formData.get('addonCategoryId') as string

    if (!name || !priceStr || !addonCategoryId) return { success: false, error: "အချက်အလက် မပြည့်စုံပါ" }

    try {
        await prisma.addon.create({
            data: {
                name,
                price: parseFloat(priceStr),
                addonCategoryId
            }
        })
        revalidatePath('/addons')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "အပိုပစ္စည်း ထည့်၍မရပါ" }
    }
}

// 🔥 ၅။ [အသစ်ဖြည့်စွက်ချက်] မီနူးဟင်းပွဲနှင့် အပိုပစ္စည်းအုပ်စုကို ကြားခံ Bridge Table ဖြင့် ချိတ်ဆက်ရန်
export async function linkMenuWithAddonCategory(formData: FormData) {
    const menuItemId = formData.get('menuItemId') as string
    const addonCategoryId = formData.get('addonCategoryId') as string

    if (!menuItemId || !addonCategoryId) {
        return { success: false, error: "ကျေးဇူးပြု၍ မီနူးနှင့် အုပ်စုကို ရွေးချယ်ပါ" }
    }

    try {
        // 🔑 MenuItemAddonCategory Bridge Table ထဲသို့ ဆက်ဆံရေး Link သွင်းခြင်း
        await prisma.menuItemAddonCategory.create({
            data: {
                menuItemId,
                addonCategoryId
            }
        })

        revalidatePath('/addons')
        return { success: true }
    } catch (error: any) {
        console.error("Error linking menu with addon category:", error)

        // Prisma Unique Constraint Error (P2002) - ရှိပြီးသားကို ထပ်ချိတ်မိပါက ပြရန်
        if (error.code === 'P2002') {
            return { success: false, error: "ဤမီနူးနှင့် ဤအုပ်စုသည် ချိတ်ဆက်ပြီးသား ဖြစ်နေပါသည်" }
        }
        return { success: false, error: "ချိတ်ဆက်ရာတွင် အမှားအယွင်းရှိပါသည်" }
    }
}

export async function updateAddonCategory(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const minSelect = parseInt(formData.get('minSelect') as string) || 0
    const maxSelect = parseInt(formData.get('maxSelect') as string) || 1

    if (!name) return { success: false, error: "အုပ်စုအမည် ဖြည့်စွက်ပါ" }

    try {
        await prisma.addonCategory.update({
            where: { id },
            data: { name, minSelect, maxSelect }
        })
        revalidatePath('/dashboard/addons')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ခြင်း မအောင်မြင်ပါ" }
    }
}

export async function deleteAddonCategory(id: string) {
    try {
        await prisma.addonCategory.delete({ where: { id } })
        revalidatePath('/dashboard/addons')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ဖျက်ဆီးခြင်း မအောင်မြင်ပါ" }
    }
}

// === 🚀 ADDON ITEM ACTIONS ===

export async function updateAddon(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)

    if (!name || isNaN(price)) return { success: false, error: "အချက်အလက် မှန်ကန်စွာဖြည့်ပါ" }

    try {
        await prisma.addon.update({
            where: { id },
            data: { name, price }
        })
        revalidatePath('/dashboard/addons')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ခြင်း မအောင်မြင်ပါ" }
    }
}

export async function deleteAddon(id: string) {
    try {
        await prisma.addon.delete({ where: { id } })
        revalidatePath('/dashboard/addons')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ဖျက်ဆီးခြင်း မအောင်မြင်ပါ" }
    }
}