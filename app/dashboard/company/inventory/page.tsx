// app/dashboard/company/inventory/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

async function getLowStockAlerts() {
    const allStocks = await prisma.inventory.findMany({
        include: {
            branch: { select: { name: true } }
        },
        orderBy: { quantity: 'asc' }
    })

    return allStocks.filter(item => item.quantity <= item.minThreshold)
}

export default async function CentralInventoryAlertsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        redirect('/dashboard')
    }

    const alertItems = await getLowStockAlerts()

    return (
        <div className="space-y-6 text-white min-h-screen">

            {/* Header + Critical Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-wider text-orange-500">📦 Global Supply Chain Monitor</h1>
                    <p className="text-xs text-slate-400 mt-0.5">ဆိုင်ခွဲအားလုံးရှိ ကုန်ကြမ်းလက်ကျန် ပြတ်လုနီးပါးဖြစ်မှုများကို ဗဟိုမှ စောင့်ကြည့်စနစ်</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                    <div>
                        <p className="text-3xs font-black text-slate-500 uppercase">Urgent Shortages</p>
                        <p className="text-sm font-black text-red-400 font-mono">{alertItems.length} Items Alert</p>
                    </div>
                </div>
            </div>

            {/* Alerts Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-sm font-bold uppercase text-slate-200">⚠️ Low Stock Warning Registry</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-2xs uppercase font-bold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3">Stock Material</th>
                                <th className="p-3">Affected Branch (ဆိုင်ခွဲ)</th>
                                <th className="p-3 text-right">Current Level (လက်ကျန်)</th>
                                <th className="p-3 text-right">Minimum Safety Limit</th>
                                <th className="p-3 text-center">Urgency Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                            {alertItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-green-400 font-medium">
                                        ✅ အားလုံးအဆင်ပြေပါသည်။ ဆိုင်ခွဲအားလုံးတွင် ကုန်ကြမ်းလက်ကျန် စိတ်ချရသော အခြေအနေ၌ ရှိနေပါသည်။
                                    </td>
                                </tr>
                            ) : (
                                alertItems.map((item) => {
                                    const isOut = item.quantity === 0

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-900/40 transition">
                                            <td className="p-3 font-bold text-white text-sm">{item.name}</td>
                                            <td className="p-3 text-slate-400 font-medium">📍 {item.branch.name}</td>
                                            <td className="p-3 text-right font-mono font-bold text-slate-200">
                                                <span className={isOut ? 'text-red-500' : 'text-yellow-500'}>
                                                    {item.quantity}
                                                </span>
                                                <span className="text-3xs text-slate-500 font-normal ml-1">{item.unit}</span>
                                            </td>

                                            {/* Safety Limit */}
                                            <td className="p-3 text-right font-mono text-slate-500">
                                                {item.minThreshold} <span className="text-3xs">{item.unit}</span>
                                            </td>

                                            {/* Urgency Badge */}
                                            <td className="p-3 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider border ${isOut
                                                    ? 'bg-red-950/50 border-red-800 text-red-400 animate-pulse'
                                                    : 'bg-yellow-950/40 border-yellow-800 text-yellow-400'
                                                    }`}>
                                                    {isOut ? '❌ Out of Stock' : '⚠️ Low Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}