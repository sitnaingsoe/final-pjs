// components/dashboard/DashboardFilters.tsx
'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DashboardFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const fromVal = searchParams.get('from') || ''
    const toVal = searchParams.get('to') || ''

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/dashboard?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-md">
            <div className="flex items-center gap-2">
                <span className="text-3xs font-black uppercase text-slate-500 tracking-wider">ရက်စွဲအလိုက်စစ်မည်:</span>

                {/* Start Date */}
                <input
                    type="date"
                    value={fromVal}
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-2xs text-white focus:outline-none focus:border-orange-500"
                />

                <span className="text-slate-600 text-xs">to</span>

                {/* End Date */}
                <input
                    type="date"
                    value={toVal}
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-2xs text-white focus:outline-none focus:border-orange-500"
                />
            </div>

            {/* Quick Clear Button */}
            {(fromVal || toVal) && (
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-3xs text-orange-500 font-bold hover:underline"
                >
                    Clear Filter
                </button>
            )}
        </div>
    )
}