// components/dashboard/CompanyHeadDashboard.tsx
'use client' // ဂရပ်ပါဝင်၍ Client Component အဖြစ် ထားနိုင်သည်

import React from 'react'
import RevenueChart from './RevenueChart'
import BranchStatusChart from './BranchStatusChart'

interface CompanyDashboardProps {
    data: {
        totalBranches: number
        totalOrders: number
        totalRevenue: number
        averageOrderValue: number
        branchTableData: any[]
        chartData: any[]
    }
}

export default function CompanyHeadDashboard({ data }: CompanyDashboardProps) {
    // အပြင်က စစ်ထုတ်ပြီးသားပေးလိုက်တဲ့ ဒေတာများကို ယူသုံးခြင်း
    const { totalBranches, totalOrders, totalRevenue, averageOrderValue, branchTableData, chartData } = data

    // CSV Download Function
    const handleDownloadCSV = () => {
        const headers = ['Branch Name', 'Manager', 'Orders', 'AOV (MMK)', 'Revenue (MMK)', 'Contribution (%)']
        const rows = branchTableData.map(b => [
            `"${b.name}"`, 
            `"${b.manager}"`, 
            b.totalOrders, 
            b.aov, 
            b.revenue, 
            b.contributionMargin
        ])
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'hq_branch_performance.csv'
        link.click()
    }

    return (
        <div className="space-y-6 lg:space-y-8 text-foreground">

            {/* 💰 ၂။ Top Cards Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass border border-border/50 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest relative z-10">Total Revenue</p>
                    <h3 className="text-3xl font-black text-foreground mt-2 tracking-tight relative z-10">{totalRevenue.toLocaleString()} <span className="text-sm text-muted-foreground/80 font-bold uppercase tracking-widest">MMK</span></h3>
                </div>
                <div className="glass border border-border/50 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest relative z-10">Avg Order Value</p>
                    <h3 className="text-3xl font-black text-foreground mt-2 tracking-tight relative z-10">{averageOrderValue.toLocaleString()} <span className="text-sm text-muted-foreground/80 font-bold uppercase tracking-widest">MMK</span></h3>
                </div>
                <div className="glass border border-border/50 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect width="4" height="6" x="10" y="16"/><path d="M3 9h18"/><path d="M9 9v4"/><path d="M15 9v4"/></svg>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest relative z-10">Active Branches</p>
                    <h3 className="text-3xl font-black text-foreground mt-2 tracking-tight relative z-10">{totalBranches}</h3>
                </div>
                <div className="glass border border-border/50 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest relative z-10">Total Orders</p>
                    <h3 className="text-3xl font-black text-foreground mt-2 tracking-tight relative z-10">{totalOrders}</h3>
                </div>
            </div>

            {/* 📊 ၁။ ဂရပ်များကို အလယ်တွင် ပြသခြင်း */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="glass border border-border/50 p-6 rounded-[2rem] shadow-lg">
                    <RevenueChart data={chartData} />
                </div>
                <div className="glass border border-border/50 p-6 rounded-[2rem] shadow-lg">
                    <BranchStatusChart data={chartData} />
                </div>
            </div>

            {/* 🏪 ၃။ Performance Table */}
            <div className="glass border border-border/50 rounded-[2rem] p-6 lg:p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <h2 className="text-base font-black uppercase tracking-wider text-foreground">Branch Performance</h2>
                    </div>
                    <button onClick={handleDownloadCSV} className="group relative bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Export CSV</span>
                    </button>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-foreground min-w-[800px]">
                        <thead className="text-xs uppercase font-black tracking-widest text-muted-foreground border-b border-border/50">
                            <tr>
                                <th className="pb-4 pl-4 font-black">Branch Name</th>
                                <th className="pb-4 font-black">Manager</th>
                                <th className="pb-4 text-center font-black">Orders</th>
                                <th className="pb-4 text-right font-black">AOV (MMK)</th>
                                <th className="pb-4 text-right font-black">Revenue (MMK)</th>
                                <th className="pb-4 text-right pr-4 font-black">Contribution %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {branchTableData.map((branch) => (
                                <tr key={branch.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-black text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                {branch.name.substring(0, 1)}
                                            </div>
                                            <span className="font-bold text-foreground">{branch.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-muted-foreground font-medium">{branch.manager}</td>
                                    <td className="py-4 text-center font-mono font-medium text-foreground">{branch.totalOrders}</td>
                                    <td className="py-4 text-right font-mono font-medium text-muted-foreground">{branch.aov.toLocaleString()}</td>
                                    <td className="py-4 text-right font-mono font-black text-foreground">{branch.revenue.toLocaleString()}</td>
                                    <td className="py-4 text-right pr-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="font-mono text-foreground font-bold">{branch.contributionMargin}%</span>
                                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                                                    style={{ width: `${branch.contributionMargin}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-card/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}