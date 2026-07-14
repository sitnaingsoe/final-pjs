// app/dashboard/store/page.tsx
import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import BranchAdminDashboard from '@/components/dashboard/BranchAdminDashboard'

export default async function StoreHomePage(
  props: {
    searchParams?: Promise<{
      page?: string;
      period?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const period = searchParams?.period || 'today';

  const session = await auth()

  if (!session?.user) redirect('/login')

  const { role, branchId } = session.user

  if (role === 'COMPANY_HEAD') {
    redirect('/dashboard/hq')
  } else if (role === 'STAFF') {
    redirect('/pos')
  }

  // ဆိုင်ခွဲမန်နေဂျာဆိုလျှင် ၎င်း၏ Dashboard သို့ ပို့မည်
  return <BranchAdminDashboard branchId={branchId || ""} page={page} period={period} />
}
