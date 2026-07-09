// app/dashboard/hq/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CompanyHeadDashboard from '@/components/dashboard/CompanyHeadDashboard'
import DashboardFilters from '@/components/dashboard/DashboardFilters'

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function HQHomePage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams

  if (!session?.user || session.user.role !== 'COMPANY_HEAD') redirect('/login')

  const dateQuery: any = {}
  if (params.from) dateQuery.gte = new Date(params.from)
  if (params.to) {
    const endDate = new Date(params.to)
    endDate.setHours(23, 59, 59, 999)
    dateQuery.lte = endDate
  }

  const hasFilter = params.from || params.to
  const invoiceWhere = hasFilter ? { paymentStatus: 'PAID' as const, createdAt: dateQuery } : { paymentStatus: 'PAID' as const }
  const orderWhere = hasFilter ? { createdAt: dateQuery } : {}

  const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { companyId: true, branch: { select: { companyId: true } } }
  })
  const companyId = currentUser?.companyId || currentUser?.branch?.companyId

  if (!companyId) {
      return <div className="p-6 text-center text-red-500">ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ။</div>
  }

  const companyOrderWhere = { ...orderWhere, branch: { companyId } }
  const companyInvoiceWhere = { ...invoiceWhere, branch: { companyId } }

  const totalBranches = await prisma.branch.count({ where: { companyId } })
  const totalOrders = await prisma.order.count({ where: companyOrderWhere })

  const invoiceSum = await prisma.invoice.aggregate({
    _sum: { finalAmount: true },
    where: companyInvoiceWhere
  })
  const totalRevenue = invoiceSum._sum.finalAmount || 0

  const branches = await prisma.branch.findMany({
    where: { companyId },
    include: {
      users: { where: { role: 'BRANCH_ADMIN' }, take: 1 },
      invoices: { where: companyInvoiceWhere, select: { finalAmount: true } },
      _count: { select: { orders: { where: companyOrderWhere } } }
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
  const dashboardPayload = { totalBranches, totalOrders, totalRevenue, branchTableData, chartData }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-orange-500">🏢 Central Control</h1>
          <p className="text-xs text-slate-400 mt-0.5">လုပ်ငန်းစုချုပ် စီမံခန့်ခွဲမှုဗဟို</p>
        </div>
        <DashboardFilters />
      </div>
      <CompanyHeadDashboard data={dashboardPayload} />
    </div>
  )
}
