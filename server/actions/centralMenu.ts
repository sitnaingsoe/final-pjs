// server/actions/menu.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function createMasterMenu(formData: FormData, selectedBranchIds: string[]) {
    const session = await auth()
    if (session?.user?.role !== 'COMPANY_HEAD') return { success: false, error: 'Unauthorized: Only Company Head can perform this action' }
    
    const companyId = session?.user?.companyId
    if (!companyId) {
        return { success: false, error: "Unauthorized: No company found" }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)

    if (!name || isNaN(basePrice)) {
        return { success: false, error: "မီနူးအမည်နှင့် စျေးနှုန်း အမှန်ကန်ဖြည့်စွက်ပါ" }
    }

    try {
        // ၁။ Master Menu ကို အရင်ဆောက်သည်
        const newMenu = await prisma.menu.create({
            data: { name, description, basePrice, companyId }
        })

        // ၂။ ရွေးချယ်လိုက်သော ဆိုင်ခွဲများအားလုံးဆီသို့ ဤမီနူးကို တစ်ပြိုင်နက် လှမ်းဖြန့်ဝေ (Assign) ပေးသည်
        if (selectedBranchIds.length > 0) {
            // Verify branches belong to the company
            const validBranches = await prisma.branch.findMany({
                where: { id: { in: selectedBranchIds }, companyId }
            })
            const validBranchIds = validBranches.map(b => b.id)

            const connectQueries = validBranchIds.map(branchId => ({
                menuId: newMenu.id,
                branchId: branchId
            }))

            await prisma.menuOnBranch.createMany({
                data: connectQueries
            })
        }

        revalidatePath('/dashboard/hq/master-menu')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ဗဟိုမီနူး ဖန်တီးခြင်း မအောင်မြင်ပါ" }
    }
}

export async function updateMasterMenu(menuId: string, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'COMPANY_HEAD') return { success: false, error: 'Unauthorized: Only Company Head can perform this action' }
    
    const companyId = session?.user?.companyId
    if (!companyId) return { success: false, error: "Unauthorized" }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)

    if (!name || isNaN(basePrice)) {
        return { success: false, error: "မီနူးအမည်နှင့် စျေးနှုန်း အမှန်ကန်ဖြည့်စွက်ပါ" }
    }

    try {
        // Verify menu belongs to company
        const menu = await prisma.menu.findUnique({ where: { id: menuId } })
        if (!menu || menu.companyId !== companyId) return { success: false, error: "Unauthorized" }

        await prisma.menu.update({
            where: { id: menuId },
            data: { name, description, basePrice }
        })
        revalidatePath('/dashboard/hq/master-menu')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ရာတွင် အမှားအယွင်း ရှိနေပါသည်" }
    }
}

// 👁️ ၂။ မီနူးကို ဖျက်မည့်အစား Status အပိတ်/အဖွင့် (Soft Delete) လုပ်မည့် Action
export async function toggleMenuStatus(menuId: string, currentStatus: boolean) {
    const session = await auth()
    if (session?.user?.role !== 'COMPANY_HEAD') return { success: false, error: 'Unauthorized: Only Company Head can perform this action' }
    
    const companyId = session?.user?.companyId
    if (!companyId) return { success: false, error: "Unauthorized" }

    try {
        // Verify menu belongs to company
        const menu = await prisma.menu.findUnique({ where: { id: menuId } })
        if (!menu || menu.companyId !== companyId) return { success: false, error: "Unauthorized" }

        await prisma.menu.update({
            where: { id: menuId },
            data: { isActive: !currentStatus } // True ဖြစ်နေလျှင် False ပြောင်း၊ False ဖြစ်နေလျှင် True ပြောင်းခြင်း
        })
        revalidatePath('/dashboard/hq/master-menu')
        return { success: true }
    } catch (error) {
        return { success: false, error: "အခြေအနေ ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}