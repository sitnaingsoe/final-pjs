// server/actions/register.ts
'use server'

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function registerAdmin(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { success: false, error: "အီးမေးလ်နှင့် စကားဝှက် ဖြည့်စွက်ရန် လိုအပ်ပါသည်" }
    }

    try {
        // ၁။ အီးမေးလ် ရှိပြီးသားလား စစ်ဆေးခြင်း
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { success: false, error: "ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည်" }
        }

        // ၂။ Password ကို Hash လုပ်ခြင်း
        const hashedPassword = await bcrypt.hash(password, 10)

        // ၃။ Database ထဲတွင် User အသစ် ဆောက်ခြင်း
        await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
            }
        })

        return { success: true }

    } catch (error) {
        console.error("Register Error:", error)
        return { success: false, error: "ဆာဗာချို့ယွင်းချက်ကြောင့် အကောင့်ဆောက်၍ မရပါ" }
    }
}