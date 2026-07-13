import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function StoreDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // အကောင့်မဝင်ထားလျှင် သို့မဟုတ် Session မရှိလျှင် Login သို့ ပို့မည်
    if (!session?.user) {
        redirect('/login')
    }

    const { role } = session.user

    // 🎯 လုံခြုံရေး အဆင့် - STAFF များကို Admin Dashboard ပေးမဝင်ဘဲ POS ဆီသို့ အတင်းမောင်းထုတ်မည်
    if (role === 'STAFF') {
        redirect('/pos')
    }

    // 🎯 COMPANY_HEAD ဆိုလျှင် သူတို့၏ Headquarter Dashboard သို့ ပို့မည်
    if (role === 'COMPANY_HEAD') {
        redirect('/dashboard/hq')
    }

    // Role က BRANCH_ADMIN ဖြစ်မှသာ အောက်ပါ Store UI များကို ဆက်လက်ပြသမည်
    return <>{children}</>
}
