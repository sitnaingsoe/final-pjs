'use server'

import { prisma } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const resend = new Resend(process.env.RESEND_API_KEY)

// 📧 ၁။ Password Reset Link ကို အီးမေးလ်သို့ ပို့ဆောင်ပေးမည့် Action
export async function sendPasswordResetEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { error: "ဤအီးမေးလ်ဖြင့် အကောင့်မရှိပါဗျာ" }

    // Secure Token ထုတ်ပြီး သက်တမ်း ၁ နာရီ သတ်မှတ်ခြင်း
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000)

    // တိုကင်ဟောင်းများဖျက်ပြီး အသစ်သိမ်းခြင်း
    await prisma.passwordResetToken.deleteMany({ where: { email } })
    await prisma.passwordResetToken.create({
        data: { email, token, expires }
    })

    // 💡 URL နောက်က Slash ပါ၊ မပါ စိတ်ချရအောင် လမ်းကြောင်းကို ဤသို့ ညှိနိုင်သည်
    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "စကားဝှက်ပြန်လည်သတ်မှတ်ခြင်း (Password Reset)",
            html: `<p>သင့်အကောင့်၏ စကားဝှက်ကို ပြန်လည်သတ်မှတ်ရန် အောက်ပါ Link ကို နှိပ်ပါ-</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>ဤ Link သည် ၁ နာရီအတွင်းသာ သက်တမ်းရှိပါသည်</p>`
        })
        return { success: "အီးမေးလ်ထဲသို့ လင့်ခ်ပို့ပေးလိုက်ပါပြီဗျာ" }
    } catch (error) {
        // 💡 Server Terminal တွင် ဘာ Error တက်လဲဆိုတာ မြင်ရအောင် console ထုတ်ခြင်း
        console.error("Resend Email Error:", error)
        return { error: "အီးမေးလ်ပို့ဆောင်မှု မအောင်မြင်ပါ" }
    }
}

export async function resetPassword(token: string, password: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken) return { error: "မှားယွင်းနေသော သို့မဟုတ် သက်တမ်းကုန်ဆုံးနေသော လင့်ခ်ဖြစ်ပါသည်" }

    if (new Date(resetToken.expires) < new Date()) {
        return { error: "လင့်ခ်သက်တမ်း ကုန်ဆုံးသွားပါပြီဗျာ" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction([
        prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.delete({
            where: { id: resetToken.id }
        })
    ])

    return { success: "စကားဝှက် ပြောင်းလဲခြင်း အောင်မြင်ပါသည်ဗျာ" }
}