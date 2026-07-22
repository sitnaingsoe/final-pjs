import React from 'react'
import { getStaffByBranch, toggleStaffStatusBranch } from '@/server/actions/staff'
import CreateStaffForm from '@/components/dashboard/CreateStaffForm'

export default async function StaffPage() {
    const res = await getStaffByBranch()
    const staffs = res.data || []

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-black flex items-center gap-3">
                        <span className="text-black">👥</span> ဝန်ထမ်းများ (Staffs)
                    </h2>
                    <p className="text-gray-500 mt-2">သင့်ဆိုင်ခွဲအတွက် အရောင်းဝန်ထမ်းများကို စီမံခန့်ခွဲပါ</p>
                </div>
                <CreateStaffForm />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
                {staffs.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <span className="text-5xl opacity-50 mb-4">👥</span>
                        <h3 className="text-xl font-bold text-gray-700">ဝန်ထမ်းစာရင်း မရှိသေးပါ</h3>
                        <p className="text-gray-400 mt-2">အပေါ်မှ 'ဝန်ထမ်းအသစ် ထည့်မည်' ကို နှိပ်၍ စတင်ပါ</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="p-4">အမည်</th>
                                    <th className="p-4">အီးမေးလ် (Login)</th>
                                    <th className="p-4">စတင်သည့်ရက်စွဲ</th>
                                    <th className="p-4 text-center">အခြေအနေ (Status)</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {staffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-gray-100/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-black font-black uppercase shadow-lg shadow-orange-500/20 shrink-0">
                                                    {staff.name?.substring(0, 2)}
                                                </div>
                                                <span className="font-bold text-gray-800">{staff.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {staff.email}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(staff.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                                staff.isActive 
                                                ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                                                : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                            }`}>
                                                {staff.isActive ? 'Active (ဖွင့်ထားသည်)' : 'Inactive (ပိတ်ထားသည်)'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <form action={async () => {
                                                'use server'
                                                await toggleStaffStatusBranch(staff.id, staff.isActive)
                                            }}>
                                                <button 
                                                    type="submit"
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                                        staff.isActive 
                                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                                                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    }`}
                                                >
                                                    {staff.isActive ? 'Disable (ပိတ်မည်)' : 'Enable (ပြန်ဖွင့်မည်)'}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
