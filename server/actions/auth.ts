// server/actions/auth.ts
'use server'

import { signIn } from "@/auth" // 🎯 ကျွန်တော်တို့ ဆောက်ခဲ့တဲ့ auth.ts ထဲက signIn ကို ယူပါ
import { AuthError } from "next-auth"

export async function loginUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { success: false, error: "အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်စွက်ပေးပါ" }
    }

    try {
        // 🎯 NextAuth ရဲ့ credentials provider ကို သုံးပြီး အကောင့်ဝင်ခြင်း
        await signIn("credentials", {
            email,
            password,
            redirect: false, // 💡 Frontend က router.push နဲ့ ရွှေ့မှာမို့ false ထားပါမယ်
        })

        return { success: true }
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