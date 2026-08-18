// app/dashboard/hq/staff/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CentralStaffClient from '@/components/dashboard/CentralStaffClient'

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
            <div className="p-8 text-center bg-card rounded-2xl shadow-sm border border-red-100 mt-6">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-wider">ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ။</p>
            </div>
        )
    }

    const [staffs, branches] = await Promise.all([
        getAllStaffs(companyId),
        prisma.branch.findMany({
            where: { companyId },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    ])

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 glass rounded-[2rem] border border-border/50 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="2"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Global Workforce Registry</h1>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Multi-branch team roster, managers & permission security</p>
                    </div>
                </div>
            </div>

            {/* Interactive Staff Search & Management Client */}
            <CentralStaffClient staffs={staffs} branches={branches} />

        </div>
    )
}