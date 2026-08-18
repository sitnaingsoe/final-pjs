// components/dashboard/StoreViewBanner.tsx
'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setActiveBranchView, clearActiveBranchView } from '@/server/actions/branch'

interface StoreViewBannerProps {
    currentBranchId: string
    currentBranchName: string
    branches: Array<{ id: string; name: string }>
}

export default function StoreViewBanner({
    currentBranchId,
    currentBranchName,
    branches
}: StoreViewBannerProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSwitchBranch = (branchId: string) => {
        if (!branchId || branchId === currentBranchId) return
        startTransition(async () => {
            await setActiveBranchView(branchId)
            router.refresh()
        })
    }

    const handleExitStoreView = () => {
        startTransition(async () => {
            await clearActiveBranchView()
            router.push('/dashboard/hq')
        })
    }

    return (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-orange-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white px-2 py-0.5 rounded-md">
                            Store View Mode
                        </span>
                        <span className="text-xs font-bold text-foreground">
                            Viewing as: <span className="text-orange-600 dark:text-orange-400 font-extrabold">{currentBranchName}</span>
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        You have master owner access to this branch's operations, menu, and tables
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
                {/* Branch Switcher Select */}
                {branches.length > 1 && (
                    <div className="relative">
                        <select
                            value={currentBranchId}
                            onChange={(e) => handleSwitchBranch(e.target.value)}
                            disabled={isPending}
                            className="text-xs font-bold bg-card border border-border text-foreground pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Open POS Link */}
                <a
                    href={`/pos?branchId=${currentBranchId}`}
                    className="px-3.5 py-2 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                    <span>Open POS</span>
                </a>

                {/* Return to HQ Button */}
                <button
                    type="button"
                    onClick={handleExitStoreView}
                    disabled={isPending}
                    className="px-3.5 py-2 bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span>Exit to HQ</span>
                </button>
            </div>
        </div>
    )
}
