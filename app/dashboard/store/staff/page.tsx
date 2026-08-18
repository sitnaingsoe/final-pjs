import React from 'react'
import { getStaffByBranch } from '@/server/actions/staff'
import CreateStaffForm from '@/components/dashboard/CreateStaffForm'
import StoreStaffClient from '@/components/dashboard/StoreStaffClient'

export default async function StaffPage() {
    const res = await getStaffByBranch()
    const staffs = res.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 glass rounded-[2rem] border border-border/50 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Staff Management</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Manage your branch crew, cashier logins & security access</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <CreateStaffForm />
                </div>
            </div>

            {/* Interactive Staff Search & Management Client */}
            <StoreStaffClient staffs={staffs} />
        </div>
    )
}
