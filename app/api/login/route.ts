// app/api/login/route.ts
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs' // 👈 Hash password တိုက်စစ်ရန်အတွက် import လုပ်ခြင်း

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်စွက်ရန် လိုအပ်ပါသည်" },
                { status: 400 }
            )
        }

        // 🔍 ၁။ ဒေတာဘေ့စ်ထဲတွင် အီးမေးလ်ဖြင့် User ရှိမရှိ အရင်ရှာဖွေခြင်း
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: "အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်" },
                { status: 401 }
            )
        }

        // 🔑 ၂။ ပို့လိုက်သော Password (Plain Text) နှင့် DB ထဲက Hashed Password ကို နှိုင်းယှဉ်ခြင်း
        // bcrypt.compare က စာသားချင်း တိုက်ရိုက်မတိုက်ဘဲ hash algorithm အတိုင်း တွက်ချက်စစ်ဆေးပေးပါသည်
        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { success: false, error: "အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်" },
                { status: 401 }
            )
        }

        // 🔓 ၃။ ကိုက်ညီမှုရှိပါက အကောင့်ဝင်ခြင်း အောင်မြင်ကြောင်း ဒေတာပြန်ပေးခြင်း
        return NextResponse.json({
            success: true,
            message: "အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }, { status: 200 })

    } catch (error) {
        console.error("Login API Error:", error)
        return NextResponse.json(
            { success: false, error: "ဆာဗာအတွင်းပိုင်း အမှားအယွင်းရှိနေပါသည်" },
            { status: 500 }
        )
    }
}