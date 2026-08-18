// app/dashboard/hq/campaigns/page.tsx
import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getCentralCampaigns } from '@/server/actions/centralPromos'
import CentralCampaignsClient from '@/components/dashboard/CentralCampaignsClient'

export default async function HQCampaignsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        redirect('/login')
    }

    const res = await getCentralCampaigns()

    if (!res.success || !res.data) {
        return (
            <div className="p-8 text-center glass rounded-[2rem] shadow-2xl border border-red-500/20 mt-6 max-w-xl mx-auto animate-in fade-in">
                <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-base font-black text-foreground uppercase tracking-wider mb-1">Error Loading Campaigns</h3>
                <p className="text-xs text-muted-foreground font-bold">{res.error || 'ကမ်ပိန်းများ ဆွဲယူ၍ မရပါ။'}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 glass rounded-[2rem] border border-border/50 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M2 12h20"/><path d="M7 12v.01"/><path d="M12 12v.01"/><path d="M17 12v.01"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Global Campaigns & Promos</h1>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Multi-branch marketing discounts, promotional codes, and vouchers</p>
                    </div>
                </div>
            </div>

            {/* Client Campaigns Component */}
            <CentralCampaignsClient data={res.data} />
        </div>
    )
}
