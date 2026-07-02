// app/api/register/route.ts
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // Postman ကနေ ပို့လိုက်တဲ့ Raw JSON ကို ဖတ်ခြင်း
        const body = await request.json()
        const { email, name, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ် လိုအပ်ပါသည်" },
                { status: 400 }
            )
        }

        // Email ရှိပြီးသားလား စစ်ဆေးခြင်း
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ထားပြီးသား ဖြစ်နေပါသည်" },
                { status: 400 }
            )
        }

        // User အသစ်ဆောက်ခြင်း
        const newUser = await prisma.user.create({
            data: {
                email,
                name: name || null,
                password: password // လက်တွေ့တွင် bcrypt ဖြင့် hash လုပ်ရန် အကြံပြုပါသည်
            }
        })

        return NextResponse.json(
            { success: true, message: "အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်", userId: newUser.id },
            { status: 201 }
        )

    } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json(
            { success: false, error: "ဆာဗာအတွင်းပိုင်း အမှားအယွင်းရှိနေပါသည်" },
            { status: 500 }
        )
    }
}