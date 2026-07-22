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
        <div className="space-y-6 text-black min-h-screen">

            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl">
                <h1 className="text-xl font-black uppercase tracking-wider text-black">👥 Global Workforce Registry</h1>
                <p className="text-xs text-gray-500 mt-0.5">ဆိုင်ခွဲအားလုံးရှိ မန်နေဂျာများနှင့် ဝန်ထမ်းအကောင့်များအား ဗဟိုမှ ထိန်းချုပ်ခန်း</p>
            </div>

            {/* Staffs Table */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-sm font-bold uppercase text-gray-800">All Employees ({staffs.length})</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                        <thead className="bg-gray-50 text-2xs uppercase font-bold text-gray-500 border-b border-gray-200">
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
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        လက်ရှိတွင် မည်သည့်ဝန်ထမ်းအကောင့်မျှ မရှိသေးပါ။
                                    </td>
                                </tr>
                            ) : (
                                staffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-gray-50/40 transition">
                                        {/* Name */}
                                        <td className="p-3 font-bold text-black">{staff.name}</td>

                                        {/* Email */}
                                        <td className="p-3 font-mono text-gray-500">{staff.email}</td>

                                        {/* Branch Name */}
                                        <td className="p-3 text-gray-700 font-medium">
                                            {staff.branch?.name || '🏪 ဗဟိုရုံးချုပ် (HQ)'}
                                        </td>

                                        {/* Role Badge */}
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-3xs font-black uppercase border ${staff.role === 'BRANCH_ADMIN'
                                                ? 'bg-orange-950/40 border-orange-800 text-gray-800'
                                                : 'bg-gray-50 border-gray-200 text-gray-500'
                                                }`}>
                                                {staff.role === 'BRANCH_ADMIN' ? 'Manager' : 'Staff'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="p-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold uppercase ${staff.isActive !== false
                                                ? 'bg-green-50 border border-green-200 text-green-600'
                                                : 'bg-red-950/40 border border-red-200 text-red-600'
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