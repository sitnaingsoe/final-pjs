// server/actions/categories.ts
'use server'

import { prisma } from "@/lib/db";
import { revalidatePath } from 'next/cache'

// ၁။ Category အားလုံးကို ဒေတာဘေ့စ်မှ ဆွဲထုတ်ယူခြင်း
export async function getCategories() {
    try {
        const categories = await prisma.menuCategory.findMany({
            include: {
                _count: {
                    select: { menuItems: true } // မီနူးတစ်ခုစီအောက်မှာ ဟင်းပွဲအရေအတွက် ဘယ်လောက်ရှိလဲပါ တခါတည်းတွက်မည်
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error("Error fetching categories:", error)
        return { success: false, error: "ဒေတာဆွဲထုတ်ရာတွင် အမှားအယွင်းရှိနေပါသည်" }
    }
}

// ၂။ Category အသစ်တစ်ခု ထည့်သွင်းခြင်း (Create)
export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) return { success: false, error: "အမျိုးအစားအမည် ထည့်ပေးရန် လိုအပ်ပါသည်" }

    try {
        await prisma.menuCategory.create({
            data: { name, description }
        })
        revalidatePath('/categories') // UI ကို ဒေတာချက်ချင်း update ဖြစ်စေရန်
        return { success: true }
    } catch (error) {
        console.error("Error creating category:", error)
        return { success: false, error: "အမျိုးအစားအသစ် ထည့်သွင်း၍ မရပါ" }
    }
}

// ၃။ Category ကို ဖျက်ပစ်ခြင်း (Delete)
export async function deleteCategory(id: string) {
    try {
        await prisma.menuCategory.delete({
            where: { id }
        })
        revalidatePath('/categories')
        return { success: true }
    } catch (error) {
        console.error("Error deleting category:", error)
        return { success: false, error: "ဤအမျိုးအစားကို ဖျက်၍မရပါ (ဟင်းပွဲများနှင့် ချိတ်ဆက်နေနိုင်ပါသည်)" }
    }
}