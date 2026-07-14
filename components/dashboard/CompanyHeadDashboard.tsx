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
        branchTableData: any[]
        chartData: any[]
    }
}

export default function CompanyHeadDashboard({ data }: CompanyDashboardProps) {
    // အပြင်က စစ်ထုတ်ပြီးသားပေးလိုက်တဲ့ ဒေတာများကို ယူသုံးခြင်း
    const { totalBranches, totalOrders, totalRevenue, branchTableData, chartData } = data

    return (
        <div className="space-y-6 text-white">

            {/* 📊 ၁။ ဂရပ်များကို ထိပ်ဆုံးတွင် ပြသခြင်း */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <RevenueChart data={chartData} />
                <BranchStatusChart data={chartData} />
            </div>

            {/* 💰 ၂။ Top Cards Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-955 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
                    <h3 className="text-2xl font-black text-orange-500 mt-1">{totalRevenue.toLocaleString()} MMK</h3>
                </div>
                <div className="bg-slate-955 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Active Branches</p>
                    <h3 className="text-2xl font-black text-white mt-1">{totalBranches}</h3>
                </div>
                <div className="bg-slate-955 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Orders</p>
                    <h3 className="text-2xl font-black text-white mt-1">{totalOrders}</h3>
                </div>
            </div>

            {/* 🏪 ၃။ Performance Table */}
            <div className="bg-slate-955 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase text-slate-200 mb-4">🏪 Branch Performance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-2xs uppercase font-bold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3">Branch Name</th>
                                <th className="p-3">Manager</th>
                                <th className="p-3 text-center">Orders</th>
                                <th className="p-3 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                            {branchTableData.map((branch) => (
                                <tr key={branch.id} className="hover:bg-slate-900/40">
                                    <td className="p-3 font-bold">{branch.name}</td>
                                    <td className="p-3 text-slate-400">{branch.manager}</td>
                                    <td className="p-3 text-center">{branch.totalOrders}</td>
                                    <td className="p-3 text-right text-orange-400 font-mono font-bold">{branch.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}