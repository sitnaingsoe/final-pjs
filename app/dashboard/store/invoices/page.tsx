// app/dashboard/store/invoices/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 8

async function getStoreInvoices(branchId: string, page: number = 1, limit: number = ITEMS_PER_PAGE, query: string = "") {
    const skip = (page - 1) * limit
    
    const whereClause: any = { branchId }
    if (query) {
        whereClause.invoiceNumber = { contains: query, mode: 'insensitive' }
    }

    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.invoice.count({ where: whereClause })
    ])
    
    // Calculate total settled revenue (all time)
    const overallTotalAgg = await prisma.invoice.aggregate({
        where: { branchId, paymentStatus: 'PAID' },
        _sum: { finalAmount: true }
    })
    const overallTotal = overallTotalAgg._sum.finalAmount || 0

    return { invoices, total, overallTotal, totalPages: Math.ceil(total / limit) }
}

export default async function StoreInvoicesPage(
    props: { searchParams?: Promise<{ page?: string, query?: string }> }
) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams?.page) || 1
    const query = searchParams?.query || ""
    const session = await auth()

    if (!session?.user?.branchId) {
        redirect('/login')
    }

    const { invoices, total, overallTotal, totalPages } = await getStoreInvoices(session.user.branchId, page, ITEMS_PER_PAGE, query)

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Area + Financial Stat Card */}
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 md:p-8 glass ">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Invoice Ledger</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Track and manage your branch revenue.</p>
                    </div>
                </div>

                {/* Quick Stat Box */}
                <div className="bg-card/50 border border-border/50 px-6 py-4 rounded-2xl flex flex-col justify-center min-w-[220px] shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Settled</span>
                    </div>
                    <span className="text-2xl font-extrabold text-foreground font-mono mt-1">
                        {overallTotal.toLocaleString()} <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">MMK</span>
                    </span>
                </div>
            </div>

            {/* Invoices List Table */}
 <div className="glass p-6 lg:p-8 ">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-border/50 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        </div>
                        <h2 className="text-base font-bold tracking-tight text-foreground">
                            Invoice Registry <span className="font-medium text-muted-foreground tracking-normal ml-1 text-sm">({total})</span>
                        </h2>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <form className="relative w-full sm:w-64 shrink-0">
                            <input 
                                name="query" 
                                defaultValue={query} 
                                placeholder="Search Invoice No..." 
                                className="w-full bg-background border border-border/50 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors" 
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </button>
                        </form>

                        <a 
                            href="/api/export/invoices" 
                            download="invoices.csv"
                            className="group relative inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover-lift overflow-hidden shrink-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Export</span>
                        </a>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-foreground min-w-[1000px]">
                        <thead className="text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border/50 bg-muted/20">
                            <tr>
                                <th className="py-4 pl-4 font-bold">Invoice No.</th>
                                <th className="py-4 font-bold">Payment Method</th>
                                <th className="py-4 text-right font-bold">Sub Total</th>
                                <th className="py-4 text-right font-bold">Tax (5%)</th>
                                <th className="py-4 text-right font-bold">Discount</th>
                                <th className="py-4 text-right font-bold">Final Amount</th>
                                <th className="py-4 text-center font-bold">Status</th>
                                <th className="py-4 text-right pr-4 font-bold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mb-4 border border-dashed border-border">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground tracking-wide mb-1">No Invoices Found</h3>
                                            <p className="text-xs text-muted-foreground font-medium">Paid invoices will appear here</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-black/5 transition-colors group">
                                        {/* Invoice Number */}
                                        <td className="py-4 pl-4 font-bold text-foreground font-mono">
                                            <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md text-xs uppercase tracking-wider mr-2 group-hover:bg-black group-hover:text-white transition-colors">#{invoice.invoiceNumber}</span>
                                        </td>

                                        {/* Payment Method */}
                                        <td className="py-4">
                                            <span className="bg-card border border-border px-3 py-1 rounded-full text-muted-foreground font-semibold uppercase text-[10px] tracking-wider shadow-sm">
                                                {invoice.paymentMethod}
                                            </span>
                                        </td>

                                        {/* Financial Breakdowns */}
                                        <td className="py-4 text-right font-mono text-muted-foreground font-medium">{invoice.subTotal.toLocaleString()}</td>
                                        <td className="py-4 text-right font-mono text-muted-foreground font-medium">{invoice.taxAmount.toLocaleString()}</td>
                                        <td className="py-4 text-right font-mono text-red-500 font-medium">-{invoice.discountAmount.toLocaleString()}</td>
                                        <td className="py-4 text-right font-mono font-bold text-foreground">{invoice.finalAmount.toLocaleString()}</td>

                                        {/* Payment Status Badges */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${invoice.paymentStatus === 'PAID'
                                                    ? 'bg-green-50/50 text-green-700 border-green-200/50'
                                                    : invoice.paymentStatus === 'UNPAID'
                                                        ? 'bg-amber-50/50 text-amber-700 border-amber-200/50'
                                                        : 'bg-red-50/50 text-red-600 border-red-200/50'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${invoice.paymentStatus === 'PAID' ? 'bg-green-500' : invoice.paymentStatus === 'UNPAID' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                                                {invoice.paymentStatus}
                                            </span>
                                        </td>

                                        {/* Date formatted */}
                                        <td className="py-4 text-right pr-4 text-muted-foreground font-mono font-medium text-xs tracking-wider">
                                            {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Showing page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <a 
                                href={page > 1 ? `/dashboard/store/invoices?page=${page - 1}${query ? `&query=${encodeURIComponent(query)}` : ''}` : '#'} 
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${page > 1 ? 'bg-card border-border/50 text-foreground hover:border-orange-500/50 hover:shadow-md' : 'bg-muted/50 border-transparent text-muted-foreground/50 cursor-not-allowed'}`}
                            >
                                Previous
                            </a>
                            <a 
                                href={page < totalPages ? `/dashboard/store/invoices?page=${page + 1}${query ? `&query=${encodeURIComponent(query)}` : ''}` : '#'} 
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${page < totalPages ? 'bg-card border-border/50 text-foreground hover:border-orange-500/50 hover:shadow-md' : 'bg-muted/50 border-transparent text-muted-foreground/50 cursor-not-allowed'}`}
                            >
                                Next
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
