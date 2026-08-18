// components/dashboard/FinancialStatementModal.tsx
'use client'

import React from 'react'

interface BranchStat {
    id: string
    name: string
    manager: string
    totalOrders: number
    revenue: number
    aov: number
    contributionMargin: number
}

interface FinancialStatementModalProps {
    isOpen: boolean
    onClose: () => void
    companyName: string
    dateRangeLabel: string
    totalRevenue: number
    totalOrders: number
    branches: BranchStat[]
}

export default function FinancialStatementModal({
    isOpen,
    onClose,
    companyName,
    dateRangeLabel,
    totalRevenue,
    totalOrders,
    branches
}: FinancialStatementModalProps) {
    if (!isOpen) return null

    const handlePrint = () => {
        window.print()
    }

    const handleExportCSV = () => {
        const headers = ['Branch Name', 'Manager', 'Total Orders', 'AOV (MMK)', 'Net Revenue (MMK)', 'Contribution (%)']
        const rows = branches.map(b => [
            `"${b.name}"`,
            `"${b.manager}"`,
            b.totalOrders,
            b.aov,
            b.revenue,
            `${b.contributionMargin}%`
        ])
        const summary = [
            [],
            ['Total Orders', totalOrders],
            ['Total Net Revenue', totalRevenue]
        ]
        const csvContent = [
            `"${companyName} - Financial Performance Statement"`,
            `"Period: ${dateRangeLabel}"`,
            [],
            headers.join(','),
            ...rows.map(r => r.join(',')),
            ...summary.map(s => s.join(','))
        ].join('\n')

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `Financial_Statement_${companyName.replace(/\s+/g, '_')}.csv`
        link.click()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md print:hidden" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="bg-card text-foreground rounded-[2rem] w-full max-w-4xl relative z-10 shadow-2xl border border-border/60 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col print:max-w-none print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0">
                
                {/* Actions Top Toolbar (Hidden on Print) */}
                <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-muted/20 print:hidden">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Financial Statement View</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted hover:border-orange-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Download CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 hover:shadow-lg flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                            <span>Print / Save as PDF</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-muted-foreground hover:bg-muted"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                        </button>
                    </div>
                </div>

                {/* Printable Statement Document Content */}
                <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8 print:p-0">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-border/80 pb-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 block mb-1">
                                Executive Financial Statement
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-foreground">{companyName}</h2>
                            <p className="text-xs text-muted-foreground font-semibold mt-1">Multi-Branch Consolidated Sales & Operations Statement</p>
                        </div>

                        <div className="text-right">
                            <div className="text-xs font-bold text-foreground">
                                <span className="text-muted-foreground uppercase text-[10px] block font-black">Reporting Period</span>
                                {dateRangeLabel}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                Generated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    {/* Consolidated Financial Summary Badges */}
                    <div className="grid grid-cols-3 gap-4 p-5 bg-muted/30 rounded-2xl border border-border/50 print:border print:border-gray-300">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Consolidated Net Revenue</span>
                            <span className="text-2xl font-black font-mono text-foreground mt-1 block">
                                {totalRevenue.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">MMK</span>
                            </span>
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Total Paid Orders</span>
                            <span className="text-2xl font-black font-mono text-foreground mt-1 block">
                                {totalOrders.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">Invoices</span>
                            </span>
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Avg Order Value (AOV)</span>
                            <span className="text-2xl font-black font-mono text-foreground mt-1 block">
                                {totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0} <span className="text-xs font-bold text-muted-foreground">MMK</span>
                            </span>
                        </div>
                    </div>

                    {/* Multi-Branch Performance Ledger */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Branch-by-Branch Breakdown</h4>
                        <div className="border border-border/60 rounded-xl overflow-hidden print:border-gray-300">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-muted/40 uppercase font-black tracking-wider text-[10px] text-muted-foreground border-b border-border/60">
                                    <tr>
                                        <th className="py-3 pl-4">Branch Name</th>
                                        <th className="py-3 px-3">Manager</th>
                                        <th className="py-3 px-3 text-center">Orders</th>
                                        <th className="py-3 px-3 text-right">AOV (MMK)</th>
                                        <th className="py-3 px-3 text-right">Net Revenue (MMK)</th>
                                        <th className="py-3 pr-4 text-right">Share (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {branches.map((b) => (
                                        <tr key={b.id}>
                                            <td className="py-3 pl-4 font-bold text-foreground">{b.name}</td>
                                            <td className="py-3 px-3 text-muted-foreground">{b.manager}</td>
                                            <td className="py-3 px-3 text-center font-mono font-medium">{b.totalOrders}</td>
                                            <td className="py-3 px-3 text-right font-mono text-muted-foreground">{b.aov.toLocaleString()}</td>
                                            <td className="py-3 px-3 text-right font-mono font-black text-foreground">{b.revenue.toLocaleString()}</td>
                                            <td className="py-3 pr-4 text-right font-mono font-bold">{b.contributionMargin}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-muted/30 font-black text-xs border-t-2 border-border/80">
                                    <tr>
                                        <td colSpan={2} className="py-3 pl-4 uppercase tracking-wider">Total Consolidated</td>
                                        <td className="py-3 px-3 text-center font-mono">{totalOrders}</td>
                                        <td className="py-3 px-3 text-right font-mono">
                                            {totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-orange-600 dark:text-orange-400">
                                            {totalRevenue.toLocaleString()} MMK
                                        </td>
                                        <td className="py-3 pr-4 text-right font-mono">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Signatures & Certification */}
                    <div className="pt-8 border-t border-border/60 grid grid-cols-2 gap-8 text-center text-xs text-muted-foreground">
                        <div>
                            <div className="h-12 border-b border-dashed border-border/80 max-w-[200px] mx-auto mb-2"></div>
                            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">Prepared By</span>
                            <span>Central Financial Administrator</span>
                        </div>
                        <div>
                            <div className="h-12 border-b border-dashed border-border/80 max-w-[200px] mx-auto mb-2"></div>
                            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">Approved By</span>
                            <span>Executive Director / Company Head</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
