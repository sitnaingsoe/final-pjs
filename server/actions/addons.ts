// server/actions/addons.ts
'use server'

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

// ၃။ အပိုပစ္စည်းအုပ်စုအသစ် ဆောက်ရန် (Addon Category Create)
export async function createAddonCategory(formData: FormData) {
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
            }
        })
        revalidatePath('/addons')
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