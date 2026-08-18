// app/dashboard/hq/invoices/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import HQInvoicesClient from '@/components/dashboard/HQInvoicesClient'

const ITEMS_PER_PAGE = 8

export default async function InvoicesPage(
    props: { searchParams?: Promise<{ page?: string; from?: string; to?: string }> }
) {
    const searchParams = await props.searchParams
    const page = Number(searchParams?.page) || 1
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const { role } = session.user

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { companyId: true, branch: { select: { companyId: true } } }
    })
    const companyId = currentUser?.companyId || currentUser?.branch?.companyId

    const dateQuery: any = {}
    if (searchParams?.from) dateQuery.gte = new Date(searchParams.from)
    if (searchParams?.to) {
        const endDate = new Date(searchParams.to)
        endDate.setHours(23, 59, 59, 999)
        dateQuery.lte = endDate
    }

    const hasDateFilter = searchParams?.from || searchParams?.to
    const baseWhere: any = role === 'COMPANY_HEAD'
        ? (companyId ? { branch: { companyId } } : {})
        : { branchId: session.user.branchId || "" }

    if (hasDateFilter) {
        baseWhere.createdAt = dateQuery
    }

    const skip = (page - 1) * ITEMS_PER_PAGE

    const [invoices, total, overallTotalAgg] = await Promise.all([
        prisma.invoice.findMany({
            where: baseWhere,
            include: { branch: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take: ITEMS_PER_PAGE
        }),
        prisma.invoice.count({ where: baseWhere }),
        prisma.invoice.aggregate({
            where: { ...baseWhere, paymentStatus: 'PAID' },
            _sum: { finalAmount: true }
        })
    ])

    const overallTotal = overallTotalAgg._sum.finalAmount || 0
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1

    let dateRangeLabel = 'All Time'
    if (searchParams?.from && searchParams?.to) {
        dateRangeLabel = `${searchParams.from} to ${searchParams.to}`
    } else if (searchParams?.from) {
        dateRangeLabel = `From ${searchParams.from}`
    } else if (searchParams?.to) {
        dateRangeLabel = `Until ${searchParams.to}`
    }

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header Area + Financial Stat Card */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 md:p-8 glass rounded-[2rem] border border-border/50 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Invoice Ledger</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Multi-branch settlement records & financial transactions</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <DashboardFilters />

                    {/* Settled Revenue Card */}
                    <div className="bg-card/60 border border-border/50 px-6 py-3.5 rounded-2xl flex flex-col justify-center min-w-[200px] shadow-sm">
                        <div className="flex items-center gap-2 mb-0.5 text-muted-foreground">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Settled Revenue</span>
                        </div>
                        <span className="text-xl font-extrabold text-foreground font-mono">
                            {overallTotal.toLocaleString()} <span className="text-xs font-bold text-muted-foreground uppercase ml-0.5">MMK</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Invoices Interactive Client Table */}
            <HQInvoicesClient
                invoices={invoices}
                total={total}
                overallTotal={overallTotal}
                page={page}
                totalPages={totalPages}
                role={role!}
                dateRangeLabel={dateRangeLabel}
            />

        </div>
    )
}