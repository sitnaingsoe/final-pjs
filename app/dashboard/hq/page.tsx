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

  const companyOrderWhere = { ...orderWhere, branch: { companyId } }
  const companyRevenueWhere = { ...invoiceWhere, branch: { companyId } }

  if (!companyId) {
      return (
          <div className="p-8 text-center bg-card rounded-2xl shadow-sm border border-red-500/20 mt-6 glass">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p className="text-sm font-bold text-red-500 uppercase tracking-wider">ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ။</p>
          </div>
      )
  }

  const totalBranches = await prisma.branch.count({ where: { companyId } })
  const totalOrders = await prisma.order.count({ where: companyOrderWhere })

  const revenueSum = await prisma.invoice.aggregate({
    _sum: { finalAmount: true },
    where: companyRevenueWhere
  })
  const totalRevenue = revenueSum._sum.finalAmount || 0

  const branches = await prisma.branch.findMany({
    where: { companyId },
    include: {
      users: { where: { role: 'BRANCH_ADMIN' }, take: 1 }
    }
  })

  // 🚀 USE THE NEW SQL VIEW WITH DIRECT INVOICE FALLBACK FOR PRODUCTION SAFETY
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let branchSales: any[] = []
  try {
      branchSales = await prisma.branchDailySales.findMany({
          where: hasFilter ? { date: dateQuery } : {}
      })
  } catch (e) {
      console.warn("BranchDailySales view missing in database, using Invoice fallback aggregation:", e)
      const invoices = await prisma.invoice.findMany({
          where: companyRevenueWhere,
          select: { branchId: true, finalAmount: true }
      })
      const grouped: { [key: string]: { branchId: string; totalRevenue: number; totalInvoices: number } } = {}
      for (const inv of invoices) {
          if (!grouped[inv.branchId]) {
              grouped[inv.branchId] = { branchId: inv.branchId, totalRevenue: 0, totalInvoices: 0 }
          }
          grouped[inv.branchId].totalRevenue += inv.finalAmount
          grouped[inv.branchId].totalInvoices += 1
      }
      branchSales = Object.values(grouped)
  }

  const branchTableData = branches.map(branch => {
    // Sum up the view data for this specific branch
    const salesForBranch = branchSales.filter(s => s.branchId === branch.id)
    const revenue = salesForBranch.reduce((sum, s) => sum + s.totalRevenue, 0)
    const totalOrders = salesForBranch.reduce((sum, s) => sum + s.totalInvoices, 0)
    const aov = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0
    const contributionMargin = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0

    return {
        id: branch.id,
        name: branch.name,
        manager: branch.users[0]?.name || 'သတ်မှတ်မထားပါ',
        totalOrders,
        revenue,
        aov,
        contributionMargin
    }
  })

  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const companyRecord = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true }
  })
  const companyName = companyRecord?.name || 'BiteCraft Food Group'

  let dateRangeLabel = 'All Time'
  if (params.from && params.to) {
    dateRangeLabel = `${params.from} to ${params.to}`
  } else if (params.from) {
    dateRangeLabel = `From ${params.from}`
  } else if (params.to) {
    dateRangeLabel = `Until ${params.to}`
  }

  const chartData = branchTableData.map(b => ({ 
    name: b.name, 
    revenue: b.revenue,
    orders: b.totalOrders
  }))

  const dashboardPayload = { 
    companyName,
    dateRangeLabel,
    totalBranches, 
    totalOrders, 
    totalRevenue, 
    averageOrderValue, 
    branchTableData, 
    chartData 
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 glass rounded-[2rem] border border-border/50 shadow-2xl relative z-10">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Central Control</h1>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Multi-branch enterprise analytics & reporting</p>
            </div>
        </div>
        <div className="shrink-0 w-full md:w-auto">
            <DashboardFilters />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative">
        <CompanyHeadDashboard data={dashboardPayload} />
      </div>
      
    </div>
  )
}
