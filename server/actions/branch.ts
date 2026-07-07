// app/server/actions/branch.ts
'use server'

import { prisma } from '@/lib/db' // သင့်ရဲ့ prisma client path အတိုင်း ပြင်ပေးပါ
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function createBranchWithAdmin(formData: FormData) {
    const branchName = formData.get('branchName') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string
    const companyId = formData.get('companyId') as string // လက်ရှိ Owner ရဲ့ Company ID

    // Admin User အတွက် ဒေတာများ
    const adminEmail = formData.get('adminEmail') as string
    const adminName = formData.get('adminName') as string
    const adminPassword = formData.get('adminPassword') as string

    if (!branchName || !adminEmail || !adminPassword || !companyId) {
        return { success: false, error: "မဖြစ်မနေ လိုအပ်သော ဒေတာများ ဖြည့်စွက်ပေးပါ" }
    }

    try {
        // 1. Email ရှိပြီးသားလား အရင်စစ်မည်
        const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
        if (existingUser) {
            return { success: false, error: "ဤအီးမေးလ်ဖြင့် အကောင့်ရှိနှင့်ပြီးသား ဖြစ်နေသည်" }
        }

        // Password ကို Hash လုပ်ခြင်း
        const hashedPassword = await bcrypt.hash(adminPassword, 10)

        // 2. Prisma Transaction သုံးပြီး Branch, Setting နှင့် User ကို တစ်ခါတည်း တွဲဆောက်မည်
        await prisma.$transaction(async (tx) => {

            // (က) Branch အသစ်ဆောက်ခြင်း
            const newBranch = await tx.branch.create({
                data: {
                    name: branchName,
                    address,
                    phone,
                    companyId,
                }
            })

            // (ခ) ၎င်း Branch အတွက် Default System Setting တစ်ခါတည်း ဆောက်ပေးခြင်း
            await tx.setting.create({
                data: {
                    restaurantName: branchName,
                    branchId: newBranch.id,
                    currency: "MMK",
                    taxRate: 5.0
                }
            })

            // (ဂ) ၎င်း Branch ကို အုပ်ချုပ်မည့် BRANCH_ADMIN အကောင့် ဆောက်ခြင်း
            await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: "BRANCH_ADMIN", // 💡 Role ကို သေချာသတ်မှတ်သည်
                    branchId: newBranch.id
                }
            })
        })

        // Dashboard ဒေတာများကို Update ဖြစ်သွားအောင် Cache ရှင်းခြင်း
        revalidatePath('/company/branches')
        return { success: true }

    } catch (error) {
        console.error(error)
        return { success: false, error: "ဆိုင်ခွဲဆောက်ရာတွင် အမှားအယွင်းရှိနေပါသည်" }
    }
}

export async function updateBranch(branchId: string, formData: FormData) {
    const name = formData.get('branchName') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string

    if (!name) return { success: false, error: "ဆိုင်ခွဲအမည် ဖြည့်စွက်ပေးရပါမည်" }

    try {
        await prisma.branch.update({
            where: { id: branchId },
            data: { name, address, phone }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ရာတွင် အမှားအယွင်း ရှိနေပါသည်" }
    }
}

// 🗑️ ၂။ ဆိုင်ခွဲကို ဖျက်ချင်သည့် Action
export async function deleteBranch(branchId: string) {
    try {
        // လူကြီးမင်း၏ Database Cascade သတ်မှတ်ချက်အရ 
        // ဆိုင်ခွဲအောက်က User များနှင့် Order များကို အရင်ရှင်းရနိုင်ပါသည်
        await prisma.$transaction([
            prisma.user.deleteMany({ where: { branchId } }),
            prisma.order.deleteMany({ where: { branchId } }),
            prisma.invoice.deleteMany({ where: { branchId } }),
            prisma.branch.delete({ where: { id: branchId } })
        ])

        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "ဖျက်ဆီးရာတွင် အမှားအယွင်း ရှိနေပါသည်" }
    }
}