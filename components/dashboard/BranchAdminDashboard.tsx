// components/dashboard/BranchAdminDashboard.tsx
import React from 'react'
import { prisma } from '@/lib/db'

import Link from 'next/link'

interface BranchDashboardProps {
    branchId: string
    page: number
    period: string
}

async function getBranchDashboardData(branchId: string, page: number, period: string) {
    const ITEMS_PER_PAGE = 5;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    let dateFilter = {};
    if (period !== 'all') {
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);

        if (period === 'today') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (period === 'month') {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
        } else if (period === 'year') {
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(11, 31);
            end.setHours(23, 59, 59, 999);
        }
        
        dateFilter = {
            createdAt: {
                gte: start,
                lte: end
            }
        };
    }

    const branchOrdersCount = await prisma.order.count({ 
        where: { branchId, ...dateFilter } 
    })

    // We use Order finalAmount since Invoices are not currently generated
    const branchOrderSum = await prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { branchId, status: { not: 'CANCELLED' }, ...dateFilter }
    })
    const branchRevenue = branchOrderSum._sum.finalAmount || 0

    const recentOrders = await prisma.order.findMany({
        where: { branchId, ...dateFilter },
        take: ITEMS_PER_PAGE,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        include: { 
            table: true,
            items: {
                include: {
                    menuItem: true
                }
            }
        }
    })

    const totalPages = Math.ceil(branchOrdersCount / ITEMS_PER_PAGE);

    return { branchOrdersCount, branchRevenue, recentOrders, totalPages, page, period }
}

export default async function BranchAdminDashboard({ branchId, page, period }: BranchDashboardProps) {
    const { branchOrdersCount, branchRevenue, recentOrders, totalPages, page: currentPage, period: currentPeriod } = await getBranchDashboardData(branchId, page, period)

    return (
        <div className="space-y-8 p-6 md:p-10 bg-slate-900 text-white min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-orange-500">🍔 Branch Dashboard</h1>
                    <p className="text-xs text-slate-400 mt-1">သင့်ဆိုင်ခွဲ၏ လည်ပတ်မှုနှင့် အော်ဒါစာရင်း</p>
                </div>
                
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <Link href="?period=today" className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentPeriod === 'today' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white'}`}>Today</Link>
                    <Link href="?period=month" className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentPeriod === 'month' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white'}`}>This Month</Link>
                    <Link href="?period=year" className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentPeriod === 'year' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white'}`}>This Year</Link>
                    <Link href="?period=all" className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentPeriod === 'all' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white'}`}>All Time</Link>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue (စုစုပေါင်း ဝင်ငွေ)</p>
                    <h3 className="text-2xl font-black text-orange-400 mt-1">{branchRevenue.toLocaleString()} MMK</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Orders (စုစုပေါင်း အော်ဒါ)</p>
                    <h3 className="text-2xl font-black text-white mt-1">{branchOrdersCount} Orders</h3>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase text-slate-200 mb-4">🔔 Recent Orders (အော်ဒါမှတ်တမ်းများ)</h2>
                <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">အော်ဒါမရှိသေးပါ။</p>
                    ) : (
                        recentOrders.map((order) => (
                            <div key={order.id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-base font-bold text-white">Order #{order.orderNumber}</p>
                                        <span className={`text-3xs px-2 py-0.5 rounded font-bold uppercase ${
                                            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                            order.status === 'READY' ? 'bg-blue-500/20 text-blue-400' :
                                            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                                            'bg-slate-800 text-slate-300'
                                        }`}>{order.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">Table: {order.table?.number || 'Take Away'} • {new Date(order.createdAt).toLocaleString()}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md flex items-center gap-2">
                                                <span className="text-xs text-slate-300">{item.menuItem.name}</span>
                                                <span className="text-3xs font-bold text-orange-400">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right md:min-w-[120px]">
                                    <p className="text-sm font-bold text-orange-400">{order.finalAmount.toLocaleString()} MMK</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                        <Link 
                            href={`?period=${currentPeriod}&page=${currentPage > 1 ? currentPage - 1 : 1}`}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentPage <= 1 ? 'pointer-events-none opacity-50 bg-slate-800 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                        >
                            &larr; Previous
                        </Link>
                        <span className="text-xs text-slate-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Link 
                            href={`?period=${currentPeriod}&page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-slate-800 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                        >
                            Next &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}