// app/dashboard/company/staff/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import StaffRowActions from '@/components/dashboard/StaffRowActions'

async function getAllStaffs(companyId: string) {
    return await prisma.user.findMany({
        where: {
            NOT: { role: 'COMPANY_HEAD' },
            branch: { companyId } // 🎯 ကုမ္ပဏီတူသော ဝန်ထမ်းများကိုသာ ဆွဲထုတ်မည်
        },
        include: {
            branch: { select: { name: true } }
        },
        orderBy: { role: 'asc' }
    })
}

export default async function CentralStaffPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        redirect('/dashboard')
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { companyId: true, branch: { select: { companyId: true } } }
    })
    const companyId = currentUser?.companyId || currentUser?.branch?.companyId

    if (!companyId) {
        return <div className="p-6 text-center text-red-500">ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ။</div>
    }

    const staffs = await getAllStaffs(companyId)

    return (
        <div className="space-y-6 text-white min-h-screen">

            {/* Header */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h1 className="text-xl font-black uppercase tracking-wider text-orange-500">👥 Global Workforce Registry</h1>
                <p className="text-xs text-slate-400 mt-0.5">ဆိုင်ခွဲအားလုံးရှိ မန်နေဂျာများနှင့် ဝန်ထမ်းအကောင့်များအား ဗဟိုမှ ထိန်းချုပ်ခန်း</p>
            </div>

            {/* Staffs Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-sm font-bold uppercase text-slate-200">All Employees ({staffs.length})</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-2xs uppercase font-bold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3">Employee Name</th>
                                <th className="p-3">Email Address</th>
                                <th className="p-3">Assigned Branch</th>
                                <th className="p-3 text-center">Role</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Security Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                            {staffs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        လက်ရှိတွင် မည်သည့်ဝန်ထမ်းအကောင့်မျှ မရှိသေးပါ။
                                    </td>
                                </tr>
                            ) : (
                                staffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-slate-900/40 transition">
                                        {/* Name */}
                                        <td className="p-3 font-bold text-white">{staff.name}</td>

                                        {/* Email */}
                                        <td className="p-3 font-mono text-slate-400">{staff.email}</td>

                                        {/* Branch Name */}
                                        <td className="p-3 text-slate-300 font-medium">
                                            {staff.branch?.name || '🏪 ဗဟိုရုံးချုပ် (HQ)'}
                                        </td>

                                        {/* Role Badge */}
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-3xs font-black uppercase border ${staff.role === 'BRANCH_ADMIN'
                                                ? 'bg-orange-950/40 border-orange-800 text-orange-400'
                                                : 'bg-slate-900 border-slate-800 text-slate-400'
                                                }`}>
                                                {staff.role === 'BRANCH_ADMIN' ? 'Manager' : 'Staff'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="p-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold uppercase ${staff.isActive !== false
                                                ? 'bg-green-950/40 border border-green-800 text-green-400'
                                                : 'bg-red-950/40 border border-red-800 text-red-400'
                                                }`}>
                                                ● {true ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>

                                        <td className="p-3 text-center">
                                            <StaffRowActions staff={staff} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}