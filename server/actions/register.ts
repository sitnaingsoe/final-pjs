// app/server/actions/register.ts
'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function registerCompanyOwner(formData: FormData) {
    const companyName = formData.get('companyName') as string // 🏢 ကုမ္ပဏီအမည်အသစ်
    const ownerName = formData.get('name') as string
    const ownerEmail = formData.get('email') as string
    const ownerPassword = formData.get('password') as string

    if (!companyName || !ownerEmail || !ownerPassword) {
        return { success: false, error: "ကုမ္ပဏီအမည်၊ အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ်များ ဖြည့်ပေးပါ" }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } })
        if (existingUser) {
            return { success: false, error: "ဤအီးမေးလ်ဖြင့် အကောင့်ရှိနှင့်ပြီးသား ဖြစ်နေသည်" }
        }

        const hashedPassword = await bcrypt.hash(ownerPassword, 10)

        // Transaction သုံးပြီး ကုမ္ပဏီအရင်ဆောက်ကာ ၎င်း ID ဖြင့် User ဆက်ဆောက်မည်
        const result = await prisma.$transaction(async (tx) => {
            // (က) ကုမ္ပဏီကို အရင်တည်ဆောက်သည်
            const newCompany = await tx.company.create({
                data: { name: companyName }
            })

            // (ခ) ၎င်းကုမ္ပဏီပိုင်ရှင် (COMPANY_HEAD) ကို ဆောက်သည် (branchId က null ဖြစ်မည်)
            const newOwner = await tx.user.create({
                data: {
                    name: ownerName,
                    email: ownerEmail,
                    password: hashedPassword,
                    role: "COMPANY_HEAD", // 💡 Role မှာ ပိုင်ရှင်ဖြစ်သွားပြီ
                    branchId: null        // 💡 ဆိုင်ခွဲအားလုံးကို ပိုင်သဖြင့် branch သီးသန့်မရှိပါ
                }
            })

            return { companyId: newCompany.id }
        })

        return { success: true, companyId: result.companyId }

    } catch (error) {
        console.error(error)
        return { success: false, error: "အကောင့်ဖွင့်ရာတွင် အမှားအယွင်းရှိနေပါသည်" }
    }
}