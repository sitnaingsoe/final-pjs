// app/dashboard/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CompanyHeadDashboard from '@/components/dashboard/CompanyHeadDashboard'
import BranchAdminDashboard from '@/components/dashboard/BranchAdminDashboard'
import DashboardFilters from '@/components/dashboard/DashboardFilters'

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams

  if (!session?.user) redirect('/login')

  const { role, branchId } = session.user

  // 🎯 ရက်စွဲ Filter ညှိခြင်း Logic
  const dateQuery: any = {}
  if (params.from) dateQuery.gte = new Date(params.from)
  if (params.to) {
    const endDate = new Date(params.to)
    endDate.setHours(23, 59, 59, 999)
    dateQuery.lte = endDate
  }

  const hasFilter = params.from || params.to

  const invoiceWhere = hasFilter
    ? { paymentStatus: 'PAID' as const, createdAt: dateQuery }
    : { paymentStatus: 'PAID' as const } // 👈 ရှေ့က string ကို Enum ဖြစ်ကြောင်း အတည်ပြုပေးခြင်း
  const orderWhere = hasFilter ? { createdAt: dateQuery } : {}

  // 🏢 COMPANY_HEAD ရဲ့ ဒေတာများကို ဤနေရာတွင် စုပေါင်း Fetch လုပ်ခြင်း
  if (role === 'COMPANY_HEAD') {
    const totalBranches = await prisma.branch.count()
    const totalOrders = await prisma.order.count({ where: orderWhere })

    const invoiceSum = await prisma.invoice.aggregate({
      _sum: { finalAmount: true },
      where: invoiceWhere
    })
    const totalRevenue = invoiceSum._sum.finalAmount || 0

    const branches = await prisma.branch.findMany({
      include: {
        users: { where: { role: 'BRANCH_ADMIN' }, take: 1 },
        invoices: { where: invoiceWhere, select: { finalAmount: true } },
        _count: { select: { orders: { where: orderWhere } } }
      }
    })

    const branchTableData = branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      manager: branch.users[0]?.name || 'သတ်မှတ်မထားပါ',
      totalOrders: branch._count.orders,
      revenue: branch.invoices.reduce((sum, inv) => sum + inv.finalAmount, 0)
    }))

    const chartData = branchTableData.map(b => ({ name: b.name, revenue: b.revenue }))

    // 🎯 ထုပ်ပိုးထားသော ဒေတာထုပ်ကြီး
    const dashboardPayload = { totalBranches, totalOrders, totalRevenue, branchTableData, chartData }

    return (
      <div className="space-y-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-orange-500">🏢 Central Control</h1>
            <p className="text-xs text-slate-400 mt-0.5">လုပ်ငန်းစုချုပ် စီမံခန့်ခွဲမှုဗဟို</p>
          </div>
          {/* ရက်စွဲပြောင်းမည့် Filter ဘား */}
          <DashboardFilters />
        </div>

        {/* 🚀 ပြဿနာမရှိရအောင် စစ်ထုတ်ပြီးသား ဒေတာထုပ်ကြီးကို Props အနေဖြင့် ပို့လိုက်ပါသည် */}
        <CompanyHeadDashboard data={dashboardPayload} />
      </div>
    )
  }

  // ဆိုင်ခွဲမန်နေဂျာဆိုလျှင် ၎င်း၏ Dashboard သို့ ပို့မည်
  return <BranchAdminDashboard branchId={branchId || ""} />
}