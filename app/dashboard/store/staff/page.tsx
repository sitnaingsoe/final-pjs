import React from 'react'
import { getStaffByBranch, toggleStaffStatusBranch } from '@/server/actions/staff'
import CreateStaffForm from '@/components/dashboard/CreateStaffForm'

export default async function StaffPage() {
    const res = await getStaffByBranch()
    const staffs = res.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Area */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 glass ">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Staff Management</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Manage your team and their access.</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <CreateStaffForm />
                </div>
            </div>

            {/* Staffs Table */}
 <div className="glass ">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <h2 className="text-base font-bold tracking-tight text-foreground">Active Staff Members <span className="font-medium text-muted-foreground ml-1 text-sm">({staffs.length})</span></h2>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-foreground min-w-[700px]">
                        <thead className="text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border/50 bg-muted/20">
                            <tr>
                                <th className="py-4 pl-4 font-bold">Employee</th>
                                <th className="py-4 font-bold">Email Address</th>
                                <th className="py-4 font-bold">Start Date</th>
                                <th className="py-4 text-center font-bold">Status</th>
                                <th className="py-4 text-right font-bold pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staffs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mb-4 border border-dashed border-border">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground tracking-wide mb-1">No Staff Found</h3>
                                            <p className="text-xs text-muted-foreground font-medium">Click 'Add Staff' above to begin</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                staffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-black/5 transition-colors group">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-foreground font-bold text-sm shrink-0 group-hover:bg-gradient-to-tr group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white transition-all shadow-sm">
                                                    {staff.name?.substring(0, 2)}
                                                </div>
                                                <span className="font-semibold text-foreground">{staff.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 font-medium text-muted-foreground">
                                            {staff.email}
                                        </td>
                                        <td className="py-4 font-medium text-muted-foreground">
                                            {new Date(staff.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                staff.isActive 
                                                ? 'bg-green-50/50 text-green-700 border-green-200/50' 
                                                : 'bg-red-50/50 text-red-600 border-red-200/50'
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
                                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md hover-lift ${
                                                        staff.isActive 
                                                        ? 'bg-white border border-border text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600' 
                                                        : 'bg-white border border-border text-green-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700'
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
