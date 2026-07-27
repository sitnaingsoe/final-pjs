import React from 'react'
import { getStaffByBranch, toggleStaffStatusBranch } from '@/server/actions/staff'
import CreateStaffForm from '@/components/dashboard/CreateStaffForm'

export default async function StaffPage() {
    const res = await getStaffByBranch()
    const staffs = res.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Staff Management</h1>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">သင့်ဆိုင်ခွဲအတွက် အရောင်းဝန်ထမ်းများကို စီမံခန့်ခွဲပါ</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <CreateStaffForm />
                </div>
            </div>

            {/* Staffs Table */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <h2 className="text-base font-black uppercase tracking-wider text-black">Active Staff Members <span className="font-bold text-gray-400 tracking-normal ml-1 text-sm">({staffs.length})</span></h2>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-700 min-w-[700px]">
                        <thead className="text-xs uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="pb-4 pl-4 font-black">Employee</th>
                                <th className="pb-4 font-black">Email Address</th>
                                <th className="pb-4 font-black">Start Date</th>
                                <th className="pb-4 text-center font-black">Status</th>
                                <th className="pb-4 text-right font-black pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staffs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Staff Found</h3>
                                            <p className="text-xs text-gray-500 font-bold">အပေါ်မှ 'Add Staff' ကို နှိပ်၍ စတင်ပါ</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                staffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-black/5 transition-colors group">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-black font-black text-sm shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                                                    {staff.name?.substring(0, 2)}
                                                </div>
                                                <span className="font-bold text-gray-900">{staff.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 font-bold text-gray-500">
                                            {staff.email}
                                        </td>
                                        <td className="py-4 font-bold text-gray-500">
                                            {new Date(staff.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                staff.isActive 
                                                ? 'bg-green-50 text-green-700' 
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {staff.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <form action={async () => {
                                                'use server'
                                                await toggleStaffStatusBranch(staff.id, staff.isActive)
                                            }}>
                                                <button 
                                                    type="submit"
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                                                        staff.isActive 
                                                        ? 'bg-white border border-red-200 text-red-500 hover:bg-red-50' 
                                                        : 'bg-white border border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {staff.isActive ? 'Disable' : 'Enable'}
                                                </button>
                                            </form>
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
