// server/actions/menu.ts
'use server'

import { prisma } from '@/lib/db'

import { auth } from '@/auth'

export async function createMasterMenu(formData: FormData, selectedBranchIds: string[]) {
    const session = await auth()
    if (!session?.user?.email) {
        return { success: false, error: "အကောင့်ဝင်ထားခြင်း မရှိပါ" }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)

    if (!name || isNaN(basePrice)) {
        return { success: false, error: "မီနူးအမည်နှင့် စျေးနှုန်း အမှန်ကန်ဖြည့်စွက်ပါ" }
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { companyId: true, branch: { select: { companyId: true } } }
        })
        const companyId = currentUser?.companyId || currentUser?.branch?.companyId

        if (!companyId) {
             return { success: false, error: "ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ" }
        }

        // ၁။ Master Menu ကို အရင်ဆောက်သည်
        const newMenu = await prisma.menu.create({
            data: { name, description, basePrice, companyId }
        })

        // ၂။ ရွေးချယ်လိုက်သော ဆိုင်ခွဲများအားလုံးဆီသို့ ဤမီနူးကို တစ်ပြိုင်နက် လှမ်းဖြန့်ဝေ (Assign) ပေးသည်
        if (selectedBranchIds.length > 0) {
            const connectQueries = selectedBranchIds.map(branchId => ({
                menuId: newMenu.id,
                branchId: branchId
            }))

            await prisma.menuOnBranch.createMany({
                data: connectQueries
            })
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: "ဗဟိုမီနူး ဖန်တီးခြင်း မအောင်မြင်ပါ" }
    }
}

export async function updateMasterMenu(menuId: string, formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)

    if (!name || isNaN(basePrice)) {
        return { success: false, error: "မီနူးအမည်နှင့် စျေးနှုန်း အမှန်ကန်ဖြည့်စွက်ပါ" }
    }

    try {
        await prisma.menu.update({
            where: { id: menuId },
            data: { name, description, basePrice }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ရာတွင် အမှားအယွင်း ရှိနေပါသည်" }
    }
}

// 👁️ ၂။ မီနူးကို ဖျက်မည့်အစား Status အပိတ်/အဖွင့် (Soft Delete) လုပ်မည့် Action
export async function toggleMenuStatus(menuId: string, currentStatus: boolean) {
    try {
        await prisma.menu.update({
            where: { id: menuId },
            data: { isActive: !currentStatus } // True ဖြစ်နေလျှင် False ပြောင်း၊ False ဖြစ်နေလျှင် True ပြောင်းခြင်း
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "အခြေအနေ ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}