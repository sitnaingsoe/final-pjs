// app/dashboard/hq/staff/page.tsx
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
        return (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-red-100 mt-6">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-wider">ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ။</p>
            </div>
        )
    }

    const staffs = await getAllStaffs(companyId)

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Global Workforce Registry</h1>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">ဆိုင်ခွဲအားလုံးရှိ မန်နေဂျာများနှင့် ဝန်ထမ်းအကောင့်များအား ဗဟိုမှ ထိန်းချုပ်ခန်း</p>
                    </div>
                </div>
            </div>

            {/* Staffs Table */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <h2 className="text-base font-black uppercase tracking-wider text-black">All Employees <span className="font-bold text-gray-400 tracking-normal ml-1 text-sm">({staffs.length})</span></h2>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-700 min-w-[800px]">
                        <thead className="text-xs uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="pb-4 pl-4 font-black">Employee Name</th>
                                <th className="pb-4 font-black">Email Address</th>
                                <th className="pb-4 font-black">Assigned Branch</th>
                                <th className="pb-4 text-center font-black">Role</th>
                                <th className="pb-4 text-center font-black">Status</th>
                                <th className="pb-4 text-right font-black pr-4">Security Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staffs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Employees Found</h3>
                                            <p className="text-xs text-gray-500 font-bold">လက်ရှိတွင် မည်သည့်ဝန်ထမ်းအကောင့်မျှ မရှိသေးပါ။</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                staffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-black/5 transition-colors group">
                                        {/* Name */}
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-black font-black text-sm shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                                                    {(staff.name || 'U').substring(0, 1)}
                                                </div>
                                                <span className="font-bold text-gray-900">{staff.name || 'Unknown'}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="py-4 font-bold text-gray-500">{staff.email}</td>

                                        {/* Branch Name */}
                                        <td className="py-4 font-bold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect width="4" height="6" x="10" y="16"/></svg>
                                                {staff.branch?.name || 'ဗဟိုရုံးချုပ် (HQ)'}
                                            </div>
                                        </td>

                                        {/* Role Badge */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                staff.role === 'BRANCH_ADMIN'
                                                ? 'bg-black text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {staff.role === 'BRANCH_ADMIN' ? 'Manager' : 'Staff'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                staff.isActive !== false
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {staff.isActive !== false ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>

                                        <td className="py-4 text-right pr-4">
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