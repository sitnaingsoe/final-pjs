// server/actions/auth.ts
'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

// =================================================================
// 🔑 ၁။ LOGIN
// =================================================================

export async function loginUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { success: false, error: "အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်စွက်ပေးပါ" }
    }

    try {
        // Credentials Provider ဖြင့် Login လုပ်ခြင်း
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        // Login အောင်မြင်ပြီးနောက် DB ထဲမှ role ရှာသည် (frontend redirect အတွက်)
        const user = await prisma.user.findUnique({
            where: { email },
            select: { role: true }
        })

        return { success: true, role: user?.role ?? 'STAFF' }

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { success: false, error: "အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်" }
                default:
                    return { success: false, error: "အကောင့်ဝင်ရာတွင် အမှားအယွင်း ရှိနေပါသည်" }
            }
        }
        throw error
    }
}


// =================================================================
// 📧 ၂။ FORGOT PASSWORD — Reset Email ပို့ခြင်း
// =================================================================

export async function sendPasswordResetEmail(email: string) {
    if (!email) {
        return { error: "အီးမေးလ် ဖြည့်ပေးပါ" }
    }

    try {
        // ၁။ ဤ Email ဖြင့် user ရှိ/မရှိ စစ်ဆေးသည်
        const user = await prisma.user.findUnique({ where: { email } })

        // 💡 Security Best Practice: user မရှိသော်လည်း success ပြသည် (email enumeration ကာကွယ်ရန်)
        if (!user) {
            return { success: "ထိုအီးမေးလ်ဖြင့် အကောင့်ရှိပါက Reset link ပေးပို့ပြီးပါပြီ။" }
        }

        // ၂။ Secure random token တစ်ခု ဖန်တီးသည် (64 hex characters)
        const token = crypto.randomBytes(32).toString("hex")

        // ၃။ Token expires 1 နာရီ အတွင်း
        const expires = new Date(Date.now() + 60 * 60 * 1000)

        // ၄။ DB ထဲတွင် User model ၌ Token သိမ်းသည်
        await prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpires: expires
            }
        })

        // ၅။ Reset Link တည်ဆောက်သည်
        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

        // ၆။ Resend ဖြင့် Email ပို့သည်
        await resend.emails.send({
            from: "BiteCraft OS <onboarding@resend.dev>",
            to: email,
            subject: "🔑 BiteCraft OS — Password Reset Request",
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0f172a; color: #e2e8f0; border-radius: 16px;">
                    <h2 style="color: #f97316; margin-bottom: 8px;">🍕 BiteCraft OS</h2>
                    <h3 style="color: #ffffff; margin-bottom: 16px;">Password Reset Request</h3>
                    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
                        လျှို့ဝှက်နံပါတ် ပြန်လည်သတ်မှတ်ရန် အောက်ပါ ခလုတ်ကို နှိပ်ပါ။<br/>
                        Link သည် <strong style="color: #f97316;">1 နာရီ</strong> အတွင်းသာ အသုံးပြုနိုင်ပါသည်။
                    </p>
                    <a href="${resetLink}"
                       style="display: inline-block; background: #f97316; color: white; text-decoration: none;
                              padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px;">
                        🔒 Password ပြင်ရန်
                    </a>
                    <p style="color: #475569; font-size: 12px; margin-top: 24px;">
                        ဤ email ကို မတောင်းဆိုပါက လျစ်လျူရှုနိုင်ပါသည်။
                    </p>
                </div>
            `
        })

        return { success: "Password ပြင်ရန် Link ကို သင့် Email သို့ ပေးပို့ပြီးပါပြီ။ Inbox စစ်ကြည့်ပါ။" }

    } catch (error) {
        console.error("[sendPasswordResetEmail]", error)
        return { error: "Email ပို့ရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့သည်။ နောက်မှ ထပ်စမ်းပါ။" }
    }   
}

// =================================================================
// 🔒 ၃။ RESET PASSWORD — Token validate + Password update
// =================================================================

export async function resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
        return { error: "Token သို့မဟုတ် Password ပျောက်ဆုံးနေသည်" }
    }

    if (newPassword.length < 6) {
        return { error: "Password အနည်းဆုံး 6 လုံး ရှိရမည်" }
    }

    try {
        // ၁။ DB ထဲမှ Token ဖြင့် User ရှာသည်
        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        })

        if (!user) {
            return { error: "Token မမှန်ကန်ပါ သို့မဟုတ် အသုံးပြုပြီးသားဖြစ်သည်" }
        }

        // ၂။ Token expire ဖြစ်/မဖြစ် စစ်သည်
        if (!user.resetTokenExpires || new Date() > user.resetTokenExpires) {
            // Expire ဖြစ်ပါက token ပြန်ဖျက်သည်
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken: null,
                    resetTokenExpires: null
                }
            })
            return { error: "Token သက်တမ်းကုန်သွားပါပြီ။ ထပ်မံ တောင်းဆိုပါ။" }
        }

        // ၃။ Password အသစ် hash လုပ်သည်
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // ၄။ User password update လုပ်ပြီး Token ရှင်းသည် (reuse မဖြစ်စေရန်)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        })

        return { success: "Password အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ! Login ဝင်ပါ။" }

    } catch (error) {
        console.error("[resetPassword]", error)
        return { error: "Password ပြောင်းရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့သည်" }
    }
}
