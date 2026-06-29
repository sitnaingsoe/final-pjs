import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, authorId } = await request.json();

    // Database ထဲမှာ Post အသစ်တစ်ခု ဆောက်မယ်
    const post = await prisma.post.create({
      data: {
        title: title,
        authorId: authorId, // ဘယ် User ရေးတာလဲဆိုတဲ့ Int (ID) ကို ထည့်ပေးရမယ်
        published: true,    // default အတိုင်းမဟုတ်ဘဲ တန်းပြီး published ဖြစ်ချင်လို့ true ပေးထားတာပါ
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Post ဆောက်လို့မရပါ (User ID မရှိတာမျိုး ဖြစ်နိုင်သည်)" }, { status: 500 });
  }
}