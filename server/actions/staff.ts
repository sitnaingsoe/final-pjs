// server/actions/staff.ts
'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// 🔐 ၁။ ဝန်ထမ်း၏ Password ကို ဗဟိုမှ အတင်း Reset ချပေးမည့် Action
export async function resetStaffPassword(userId: number, formData: FormData) {
    const session = await auth()
    const companyId = session?.user?.companyId
    if (!companyId) return { success: false, error: "Unauthorized" }

    const newPassword = formData.get('newPassword') as string

    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "လျှို့ဝှက်နံပါတ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်" }
    }

    try {
        // Verify user belongs to a branch in this company
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { branch: true }
        })

        if (!user || user.branch?.companyId !== companyId) {
            return { success: false, error: "Unauthorized" }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })
        revalidatePath('/dashboard/hq/staff')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Password ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}

// 🚫 ၂။ ဝန်ထမ်းအကောင့်ကို ပိတ်ခြင်း/ပြန်ဖွင့်ခြင်း Action
export async function toggleStaffStatus(userId: number, currentStatus: boolean) {
    const session = await auth()
    const companyId = session?.user?.companyId
    if (!companyId) return { success: false, error: "Unauthorized" }

    try {
        // Verify user belongs to a branch in this company
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { branch: true }
        })

        if (!user || user.branch?.companyId !== companyId) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isActive: !currentStatus }
        })
        revalidatePath('/dashboard/hq/staff')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Status ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}