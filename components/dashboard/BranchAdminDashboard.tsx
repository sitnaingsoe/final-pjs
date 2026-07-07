// components/dashboard/BranchAdminDashboard.tsx
import React from 'react'
import { prisma } from '@/lib/db'

interface BranchDashboardProps {
    branchId: string
}

async function getBranchDashboardData(branchId: string) {
    const branchOrdersCount = await prisma.order.count({ where: { branchId } })

    const branchInvoiceSum = await prisma.invoice.aggregate({
        _sum: { finalAmount: true },
        where: { branchId, paymentStatus: 'PAID' }
    })
    const branchRevenue = branchInvoiceSum._sum.finalAmount || 0

    // လတ်တလော အော်ဒါ (၅) ခု ပြရန်
    const recentOrders = await prisma.order.findMany({
        where: { branchId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { table: true }
    })

    return { branchOrdersCount, branchRevenue, recentOrders }
}

export default async function BranchAdminDashboard({ branchId }: BranchDashboardProps) {
    const { branchOrdersCount, branchRevenue, recentOrders } = await getBranchDashboardData(branchId)

    return (
        <div className="space-y-8 p-6 md:p-10 bg-slate-900 text-white min-h-screen">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-orange-500">🍔 Branch Dashboard</h1>
                <p className="text-xs text-slate-400 mt-1">သင့်ဆိုင်ခွဲ၏ ယနေ့လည်ပတ်မှုနှင့် အော်ဒါစာရင်း</p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Branch Revenue (သင့်ဆိုင်ခွဲဝင်ငွေ)</p>
                    <h3 className="text-2xl font-black text-orange-400 mt-1">{branchRevenue.toLocaleString()} MMK</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Branch Orders (အော်ဒါအရေအတွက်)</p>
                    <h3 className="text-2xl font-black text-white mt-1">{branchOrdersCount} Orders</h3>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase text-slate-200 mb-4">🔔 Recent Orders (လတ်တလောအော်ဒါများ)</h2>
                <div className="space-y-3">
                    {recentOrders.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">ယနေ့အတွက် အော်ဒါမရှိသေးပါ။</p>
                    ) : (
                        recentOrders.map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-white">Order #{order.orderNumber}</p>
                                    <p className="text-xs text-slate-400">Table: {order.table?.number || 'Take Away'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-orange-400">{order.finalAmount.toLocaleString()} MMK</p>
                                    <span className="text-2xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">{order.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}