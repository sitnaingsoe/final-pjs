'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface InvoiceItem {
    id: string
    invoiceNumber: string
    paymentMethod: string
    paymentStatus: string
    subTotal: number
    taxAmount: number
    discountAmount: number
    finalAmount: number
    createdAt: Date
    branch?: { name: string } | null
}

interface HQInvoicesClientProps {
    invoices: InvoiceItem[]
    total: number
    overallTotal: number
    page: number
    totalPages: number
    role: string
    dateRangeLabel: string
}

export default function HQInvoicesClient({
    invoices,
    total,
    overallTotal,
    page,
    totalPages,
    role,
    dateRangeLabel
}: HQInvoicesClientProps) {
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')

    const getPageUrl = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        return `/dashboard/hq/invoices?${params.toString()}`
    }

    const filteredInvoices = invoices.filter(inv => {
        const query = searchQuery.toLowerCase()
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(query)
        const matchBranch = inv.branch?.name?.toLowerCase().includes(query) || false
        const matchMethod = inv.paymentMethod.toLowerCase().includes(query)
        return matchNumber || matchBranch || matchMethod
    })

    const handleExportCSV = () => {
        const headers = ['Invoice Number', 'Branch', 'Payment Method', 'SubTotal (MMK)', 'Tax (MMK)', 'Discount (MMK)', 'Final Amount (MMK)', 'Status', 'Date']
        const rows = filteredInvoices.map(inv => [
            `"${inv.invoiceNumber}"`,
            `"${inv.branch?.name || 'N/A'}"`,
            `"${inv.paymentMethod}"`,
            inv.subTotal,
            inv.taxAmount,
            inv.discountAmount,
            inv.finalAmount,
            `"${inv.paymentStatus}"`,
            `"${new Date(inv.createdAt).toLocaleDateString('en-GB')}"`
        ])
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    return (
        <div className="glass border border-border/50 rounded-[2rem] p-6 lg:p-8 shadow-2xl space-y-6">
            
            {/* Toolbar: Title, Search & Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-foreground">
                            Invoice Registry <span className="font-medium text-muted-foreground tracking-normal ml-1 text-sm">({total})</span>
                        </h2>
                        <p className="text-[11px] text-muted-foreground font-medium">Period: {dateRangeLabel}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by invoice #, branch..."
                            className="bg-card border border-border text-foreground pl-9 pr-4 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-56 sm:w-64"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>

                    {/* Export CSV Button */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-card hover:bg-muted border border-border text-foreground hover:border-orange-500/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-foreground min-w-[1000px]">
                    <thead className="text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border/50 bg-muted/20">
                        <tr>
                            <th className="py-4 pl-4 font-bold">Invoice No.</th>
                            {role === 'COMPANY_HEAD' && <th className="py-4 font-bold">Branch</th>}
                            <th className="py-4 font-bold">Payment Method</th>
                            <th className="py-4 text-right font-bold">Sub Total</th>
                            <th className="py-4 text-right font-bold">Tax</th>
                            <th className="py-4 text-right font-bold">Discount</th>
                            <th className="py-4 text-right font-bold">Final Amount</th>
                            <th className="py-4 text-center font-bold">Status</th>
                            <th className="py-4 text-right pr-4 font-bold">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={role === 'COMPANY_HEAD' ? 9 : 8} className="py-12 text-center">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mx-auto mb-4 border border-dashed border-border">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground mb-1">No Invoices Found</h3>
                                    <p className="text-xs text-muted-foreground font-medium">မည်သည့် ပြေစာမှတ်တမ်းမျှ မရှိသေးပါ။</p>
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="py-4 pl-4 font-bold text-foreground font-mono">
                                        <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md text-xs uppercase tracking-wider mr-2 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                            #{invoice.invoiceNumber}
                                        </span>
                                    </td>

                                    {role === 'COMPANY_HEAD' && (
                                        <td className="py-4 text-foreground font-bold text-sm">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                                {invoice.branch?.name || '-'}
                                            </div>
                                        </td>
                                    )}

                                    <td className="py-4">
                                        <span className="bg-card border border-border px-3 py-1 rounded-full text-muted-foreground font-semibold uppercase text-[10px] tracking-wider shadow-sm">
                                            {invoice.paymentMethod}
                                        </span>
                                    </td>

                                    <td className="py-4 text-right font-mono text-muted-foreground font-medium">{invoice.subTotal.toLocaleString()}</td>
                                    <td className="py-4 text-right font-mono text-muted-foreground font-medium">{invoice.taxAmount.toLocaleString()}</td>
                                    <td className="py-4 text-right font-mono text-red-500 font-medium">-{invoice.discountAmount.toLocaleString()}</td>
                                    <td className="py-4 text-right font-mono font-bold text-foreground">{invoice.finalAmount.toLocaleString()}</td>

                                    <td className="py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                            invoice.paymentStatus === 'PAID'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : invoice.paymentStatus === 'UNPAID'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-red-50 text-red-600 border-red-200'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                invoice.paymentStatus === 'PAID' ? 'bg-green-500' : invoice.paymentStatus === 'UNPAID' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></span>
                                            {invoice.paymentStatus}
                                        </span>
                                    </td>

                                    <td className="py-4 text-right pr-4 text-muted-foreground font-mono font-medium text-xs tracking-wider">
                                        {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/50 pt-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Showing page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <a 
                            href={page > 1 ? getPageUrl(page - 1) : '#'} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${page > 1 ? 'bg-card border-border text-foreground hover:border-orange-500/50 hover:shadow-md' : 'bg-muted border-transparent text-muted-foreground/40 cursor-not-allowed'}`}
                        >
                            Previous
                        </a>
                        <a 
                            href={page < totalPages ? getPageUrl(page + 1) : '#'} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${page < totalPages ? 'bg-card border-border text-foreground hover:border-orange-500/50 hover:shadow-md' : 'bg-muted border-transparent text-muted-foreground/40 cursor-not-allowed'}`}
                        >
                            Next
                        </a>
                    </div>
                </div>
            )}

        </div>
    )
}
