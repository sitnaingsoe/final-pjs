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
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-md">
            <div className="flex items-center gap-2">
                <span className="text-3xs font-black uppercase text-gray-400 tracking-wider">ရက်စွဲအလိုက်စစ်မည်:</span>

                {/* Start Date */}
                <input
                    type="date"
                    value={fromVal}
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-2xs text-black focus:outline-none focus:border-black"
                />

                <span className="text-gray-300 text-xs">to</span>

                {/* End Date */}
                <input
                    type="date"
                    value={toVal}
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-2xs text-black focus:outline-none focus:border-black"
                />
            </div>

            {/* Quick Clear Button */}
            {(fromVal || toVal) && (
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-3xs text-black font-bold hover:underline"
                >
                    Clear Filter
                </button>
            )}
        </div>
    )
}