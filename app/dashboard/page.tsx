// app/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRouterPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  const { role } = session.user

  if (role === 'COMPANY_HEAD') {
    redirect('/dashboard/hq')
  } else if (role === 'BRANCH_ADMIN') {
    redirect('/dashboard/store')
  } else {
    // 🎯 ဝန်ထမ်း (STAFF) ဆိုလျှင် POS Terminal ဆီသို့ တိုက်ရိုက် သွားစေမည်
    redirect('/pos')
  }
}