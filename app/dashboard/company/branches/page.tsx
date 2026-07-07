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
        select: { branch: { select: { companyId: true } } }
    })

    let companyId = currentUser?.branch?.companyId
    if (!companyId) {
        const firstCompany = await prisma.company.findFirst({ select: { id: true } })
        companyId = firstCompany?.id || ""
    }

    const branches = await getBranchesData(companyId)

    return (
        <div className="space-y-6 text-white min-h-screen">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-wider text-orange-500">Store & Branch Architecture</h1>
                    <p className="text-xs text-slate-400 mt-0.5">ဆိုင်ခွဲသစ်များ စီမံခန့်ခွဲခြင်း (CRUD Control Panel)</p>
                </div>
                <CreateBranchDialog companyId={companyId} />
            </div>

            {/* Branches Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-sm font-bold uppercase text-slate-200">🏪 Active Branches List ({branches.length})</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-2xs uppercase font-bold text-slate-400 border-b border-slate-800">
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
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        မည်သည့်ဆိုင်ခွဲမျှ မရှိသေးပါ။
                                    </td>
                                </tr>
                            ) : (
                                branches.map((branch) => {
                                    const manager = branch.users[0];
                                    return (
                                        <tr key={branch.id} className="hover:bg-slate-900/40 transition">
                                            <td className="p-3 font-bold text-white">
                                                <div>{branch.name}</div>
                                                <div className="text-3xs text-slate-500 font-normal mt-0.5">{branch.address || 'လိပ်စာမရှိ'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-semibold text-slate-300">{manager?.name || 'မရှိပါ'}</div>
                                                <div className="text-3xs text-slate-500 font-mono">{manager?.email || '-'}</div>
                                            </td>
                                            <td className="p-3 text-center font-mono font-bold text-slate-400">{branch._count.users} ဦး</td>
                                            <td className="p-3 text-center font-mono font-bold text-orange-400">{branch._count.orders} Orders</td>

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