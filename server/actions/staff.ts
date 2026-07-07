// server/actions/staff.ts
'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// 🔐 ၁။ ဝန်ထမ်း၏ Password ကို ဗဟိုမှ အတင်း Reset ချပေးမည့် Action
export async function resetStaffPassword(userId: number, formData: FormData) {
    const newPassword = formData.get('newPassword') as string

    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "လျှို့ဝှက်နံပါတ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်" }
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: userId }, // 🎯 အပေါ်က userId က string ဖြစ်သွားတဲ့အတွက် Prisma က အိုကေသွားပါပြီ
            data: { password: hashedPassword }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Password ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}

// 🚫 ၂။ ဝန်ထမ်းအကောင့်ကို ပိတ်ခြင်း/ပြန်ဖွင့်ခြင်း Action
// (လူကြီးမင်း၏ User model တွင် status သို့မဟုတ် isActive field ပါဝင်သည်ဟု ယူဆပါသည်)
export async function toggleStaffStatus(userId: number, currentStatus: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive: !currentStatus } // True ဖြစ်နေလျှင် False ပြောင်း၊ False ဖြစ်နေလျှင် True ပြောင်းခြင်း
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Status ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}