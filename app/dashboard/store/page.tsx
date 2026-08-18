// app/dashboard/store/page.tsx
import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import BranchAdminDashboard from '@/components/dashboard/BranchAdminDashboard'

import { getEffectiveBranchId } from '@/lib/branchContext'

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

  const { role } = session.user

  if (role === 'STAFF') {
    redirect('/pos')
  }

  const effectiveBranchId = await getEffectiveBranchId()

  if (!effectiveBranchId) {
    if (role === 'COMPANY_HEAD') {
      redirect('/dashboard/hq')
    }
    return (
      <div className="p-8 text-center glass rounded-2xl border border-red-200 text-red-600 font-bold">
        ဆိုင်ခွဲ အချက်အလက် ရှာမတွေ့ပါ။
      </div>
    )
  }

  return <BranchAdminDashboard branchId={effectiveBranchId} page={page} period={period} />
}
