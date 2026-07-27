// app/dashboard/hq/branches/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CreateBranchDialog from '@/components/dashboard/CreateBranchDialog'
import BranchRowActions from '@/components/dashboard/BranchRowActions'

async function getBranchesData(companyId: string) {
    return await prisma.branch.findMany({
        where: { companyId },
        include: {
            users: {
                where: { role: 'BRANCH_ADMIN' },
                select: { name: true, email: true }
            },
            _count: { select: { orders: true, users: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function ManageBranchesPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        redirect('/dashboard')
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { 
            companyId: true, 
            branch: { select: { companyId: true } } 
        }
    })

    // 🎯 ပိုင်ရှင်ဆိုလျှင် companyId တိုက်ရိုက်ရှိမည်၊ ဝန်ထမ်းဆိုလျှင် branch မှတစ်ဆင့်ယူမည်
    const companyId = currentUser?.companyId || currentUser?.branch?.companyId

    if (!companyId) {
        return (
            <div className="p-8 text-center bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 mt-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p className="text-sm font-black text-red-600 uppercase tracking-widest">သင်၏ အကောင့်သည် မည်သည့်ကုမ္ပဏီနှင့်မျှ ချိတ်ဆက်ထားခြင်းမရှိပါ။</p>
            </div>
        )
    }

    const branches = await getBranchesData(companyId)

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect width="4" height="6" x="10" y="16"/><path d="M3 9h18"/><path d="M9 9v4"/><path d="M15 9v4"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Store Architecture</h1>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">ဆိုင်ခွဲသစ်များ စီမံခန့်ခွဲခြင်း</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <CreateBranchDialog companyId={companyId} />
                </div>
            </div>

            {/* Branches Table */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect width="4" height="6" x="10" y="16"/><path d="M3 9h18"/><path d="M9 9v4"/><path d="M15 9v4"/></svg>
                    </div>
                    <h2 className="text-base font-black uppercase tracking-wider text-black">Active Branches <span className="font-bold text-gray-400 tracking-normal ml-1 text-sm">({branches.length})</span></h2>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-700 min-w-[800px]">
                        <thead className="text-xs uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="pb-4 pl-4 font-black">Branch Name</th>
                                <th className="pb-4 font-black">Manager Info</th>
                                <th className="pb-4 text-center font-black">Staff Count</th>
                                <th className="pb-4 text-center font-black">Total Orders</th>
                                <th className="pb-4 text-center font-black pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {branches.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect width="4" height="6" x="10" y="16"/><path d="M3 9h18"/><path d="M9 9v4"/><path d="M15 9v4"/></svg>
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Branches Found</h3>
                                            <p className="text-xs text-gray-500 font-bold">မည်သည့်ဆိုင်ခွဲမျှ မရှိသေးပါ။</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                branches.map((branch) => {
                                    const manager = branch.users[0];
                                    return (
                                        <tr key={branch.id} className="hover:bg-black/5 transition-colors group">
                                            <td className="py-4 pl-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-black text-sm shrink-0 group-hover:bg-black group-hover:text-white transition-colors shadow-sm">
                                                        {branch.name.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-black">{branch.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                                            {branch.address || 'လိပ်စာမရှိ'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-black text-xs shrink-0 shadow-sm">
                                                        {manager?.name ? manager.name.substring(0, 1).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{manager?.name || 'မရှိပါ'}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold tracking-widest mt-0.5">{manager?.email || '-'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center">
                                                <div className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-md bg-white border border-gray-100 text-gray-600 font-black text-xs shadow-sm">
                                                    {branch._count.users}
                                                </div>
                                            </td>
                                            <td className="py-4 text-center">
                                                <div className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-md bg-white border border-gray-100 text-gray-900 font-black text-xs shadow-sm">
                                                    {branch._count.orders}
                                                </div>
                                            </td>

                                            {/* 🎯 Edit & Delete ခလုတ်များ အလုပ်လုပ်မည့် Component လှမ်းခေါ်ခြင်း */}
                                            <td className="py-4 text-center pr-4">
                                                <BranchRowActions branch={branch} />
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