// app/dashboard/store/page.tsx
import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import BranchAdminDashboard from '@/components/dashboard/BranchAdminDashboard'

export default async function StoreHomePage() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  const { role, branchId } = session.user

  if (role === 'COMPANY_HEAD') {
    redirect('/dashboard/hq')
  }

  // ဆိုင်ခွဲမန်နေဂျာဆိုလျှင် ၎င်း၏ Dashboard သို့ ပို့မည်
  return <BranchAdminDashboard branchId={branchId || ""} />
}
