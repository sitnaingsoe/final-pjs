// server/actions/menu.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ၁။ မီနူး ဟင်းပွဲအားလုံးကို သက်ဆိုင်ရာ Category အမည်နှင့်တကွ ဆွဲထုတ်ခြင်း
export async function getMenuItems() {
    try {
        const items = await prisma.menuItem.findMany({
            include: {
                category: true // Category Table မှ အချက်အလက်များကိုပါ ပူးတွဲယူမည်
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: items }
    } catch (error) {
        console.error("Error fetching menu items:", error)
        return { success: false, error: "မီနူးများ ဆွဲထုတ်၍ မရပါ" }
    }
}

export async function createMenuItem(formData: FormData) {
    const name = formData.get('name') as string
    const priceStr = formData.get('price') as string
    const categoryId = formData.get('categoryId') as string
    const description = formData.get('description') as string

    if (!name || !priceStr || !categoryId) {
        return { success: false, error: "လိုအပ်သော အချက်အလက်များ ဖြည့်စွက်ရန် လိုအပ်ပါသည်" }
    }



    try {
        await prisma.menuItem.create({
            data: {
                name,
                price: parseFloat(priceStr), // String ကို Float (Number) ပြောင်းလဲခြင်း
                categoryId,
                description,
                isActive: true
            }
        })
        revalidatePath('/menu')
        return { success: true }
    } catch (error) {
        console.error("Error creating menu item:", error)
        return { success: false, error: "မီနူးအသစ် ထည့်သွင်း၍ မရပါ" }
    }
}

export async function deleteMenuItem(id: string) {
    try {
        await prisma.menuItem.delete({
            where: { id }
        })
        revalidatePath('/menu')
        return { success: true }
    } catch (error) {
        console.error("Error deleting menu item:", error)
        return { success: false, error: "ဤမီနူးကို ဖျက်၍မရပါ" }
    }
}

// server/actions/menu.ts ဖိုင်ထဲတွင် ဤကုဒ်အတိုင်း လဲလှယ်ပေးပါ

// server/actions/menu.ts

export async function getMenuItemsWithDetails() {
    try {
        const menuItems = await prisma.menuItem.findMany({
            include: {
                category: true, // MenuCategory ဆွဲယူခြင်း
                addonCategories: {
                    include: {
                        addonCategory: { // 🔑 Bridge Table ထဲကမှတစ်ဆင့် တကယ့် AddonCategory ထဲသို့ ဝင်ခြင်း
                            include: {
                                addons: true // 🔑 ၎င်း AddonCategory ထဲရှိ တကယ့် addons စာရင်းကို ဆွဲထုတ်ခြင်း
                            }
                        }
                    }
                }
            },
            orderBy: { name: "asc" }
        })
        return { success: true, data: menuItems }
    } catch (error) {
        console.error("Prisma Fetch Menu Error:", error)
        return { success: false, error: "မီနူးများ ဆွဲထုတ်၍ မရပါ" }
    }
}

export async function getCategories() {
    try {
        const categories = await prisma.menuCategory.findMany({
            orderBy: { name: 'asc' }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Category များ ဆွဲထုတ်၍ မရပါ" }
    }
}