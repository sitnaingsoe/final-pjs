// app/dashboard/company/branches/page.tsx
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
            <div className="p-6 text-center text-red-500">
                သင်၏ အကောင့်သည် မည်သည့်ကုမ္ပဏီနှင့်မျှ ချိတ်ဆက်ထားခြင်းမရှိပါ။
            </div>
        )
    }

    const branches = await getBranchesData(companyId)

    return (
        <div className="space-y-6 text-black min-h-screen">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-wider text-black">Store & Branch Architecture</h1>
                    <p className="text-xs text-gray-500 mt-0.5">ဆိုင်ခွဲသစ်များ စီမံခန့်ခွဲခြင်း (CRUD Control Panel)</p>
                </div>
                <CreateBranchDialog companyId={companyId} />
            </div>

            {/* Branches Table */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-sm font-bold uppercase text-gray-800">🏪 Active Branches List ({branches.length})</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                        <thead className="bg-gray-50 text-2xs uppercase font-bold text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="p-3">Branch Name</th>
                                <th className="p-3">Manager Info</th>
                                <th className="p-3 text-center">Staff Count</th>
                                <th className="p-3 text-center">Total Orders</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                            {branches.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        မည်သည့်ဆိုင်ခွဲမျှ မရှိသေးပါ။
                                    </td>
                                </tr>
                            ) : (
                                branches.map((branch) => {
                                    const manager = branch.users[0];
                                    return (
                                        <tr key={branch.id} className="hover:bg-gray-50/40 transition">
                                            <td className="p-3 font-bold text-black">
                                                <div>{branch.name}</div>
                                                <div className="text-3xs text-gray-400 font-normal mt-0.5">{branch.address || 'လိပ်စာမရှိ'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-semibold text-gray-700">{manager?.name || 'မရှိပါ'}</div>
                                                <div className="text-3xs text-gray-400 font-mono">{manager?.email || '-'}</div>
                                            </td>
                                            <td className="p-3 text-center font-mono font-bold text-gray-500">{branch._count.users} ဦး</td>
                                            <td className="p-3 text-center font-mono font-bold text-gray-800">{branch._count.orders} Orders</td>

                                            {/* 🎯 Edit & Delete ခလုတ်များ အလုပ်လုပ်မည့် Component လှမ်းခေါ်ခြင်း */}
                                            <td className="p-3 text-center">
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