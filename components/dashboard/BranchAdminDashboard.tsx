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
            table: true
        }
    })

    const totalPages = Math.ceil(branchOrdersCount / ITEMS_PER_PAGE);

    return { branchOrdersCount, branchRevenue, recentOrders, totalPages, page, period }
}

export default async function BranchAdminDashboard({ branchId, page, period }: BranchDashboardProps) {
    const { branchOrdersCount, branchRevenue, recentOrders, totalPages, page: currentPage, period: currentPeriod } = await getBranchDashboardData(branchId, page, period)

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect width="4" height="6" x="10" y="16"/><path d="M3 9h18"/><path d="M9 9v4"/><path d="M15 9v4"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Branch Dashboard</h1>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">သင့်ဆိုင်ခွဲ၏ လည်ပတ်မှုနှင့် အော်ဒါစာရင်း</p>
                    </div>
                </div>
                
                <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner">
                    <Link href="?period=today" className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${currentPeriod === 'today' ? 'bg-white text-black shadow-[0_2px_10px_rgb(0,0,0,0.05)]' : 'text-gray-400 hover:text-black'}`}>Today</Link>
                    <Link href="?period=month" className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${currentPeriod === 'month' ? 'bg-white text-black shadow-[0_2px_10px_rgb(0,0,0,0.05)]' : 'text-gray-400 hover:text-black'}`}>Month</Link>
                    <Link href="?period=year" className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${currentPeriod === 'year' ? 'bg-white text-black shadow-[0_2px_10px_rgb(0,0,0,0.05)]' : 'text-gray-400 hover:text-black'}`}>Year</Link>
                    <Link href="?period=all" className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${currentPeriod === 'all' ? 'bg-white text-black shadow-[0_2px_10px_rgb(0,0,0,0.05)]' : 'text-gray-400 hover:text-black'}`}>All Time</Link>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-xl border border-gray-100 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Total Revenue <span className="font-bold tracking-normal opacity-80">(စုစုပေါင်း ဝင်ငွေ)</span></p>
                    <h3 className="text-3xl lg:text-4xl font-black text-black mt-2 tracking-tight relative z-10">{branchRevenue.toLocaleString()} <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">MMK</span></h3>
                </div>
                <div className="bg-white/60 backdrop-blur-xl border border-gray-100 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Total Orders <span className="font-bold tracking-normal opacity-80">(စုစုပေါင်း အော်ဒါ)</span></p>
                    <h3 className="text-3xl lg:text-4xl font-black text-black mt-2 tracking-tight relative z-10">{branchOrdersCount} <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Orders</span></h3>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    </div>
                    <h2 className="text-base font-black uppercase tracking-wider text-black">Recent Orders <span className="font-bold text-gray-400 tracking-normal ml-1 text-sm">(အော်ဒါမှတ်တမ်းများ)</span></h2>
                </div>
                
                <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Orders Found</h3>
                            <p className="text-xs text-gray-500 font-bold">အော်ဒါမရှိသေးပါ။</p>
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <div key={order.id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-md transition-all group">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-sm font-black text-black uppercase tracking-wider">Order #{order.orderNumber}</p>
                                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest ${
                                            order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                                            order.status === 'READY' ? 'bg-blue-100 text-blue-600' :
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>{order.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-3">
                                        <span className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                            {order.table?.number || 'Take Away'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {((order.items as any[]) || []).map((item, idx) => (
                                            <div key={idx} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-700">{item.name}</span>
                                                <span className="text-[10px] font-black text-black bg-white px-1.5 py-0.5 rounded-md shadow-sm">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right md:min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 mt-4 md:mt-0">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-xl font-black text-black tracking-tight">{order.finalAmount.toLocaleString()} <span className="text-xs text-gray-400 uppercase tracking-widest">MMK</span></p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <Link 
                            href={`?period=${currentPeriod}&page=${currentPage > 1 ? currentPage - 1 : 1}`}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${currentPage <= 1 ? 'pointer-events-none opacity-50 bg-gray-50 text-gray-400' : 'bg-white border border-gray-200 hover:border-black hover:shadow-md text-black group'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                            Prev
                        </Link>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            <span className="text-black">{currentPage}</span> / {totalPages}
                        </span>
                        <Link 
                            href={`?period=${currentPeriod}&page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-gray-50 text-gray-400' : 'bg-black text-white hover:bg-gray-900 hover:shadow-lg shadow-black/20 group'}`}
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}