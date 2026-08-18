// components/dashboard/DashboardFilters.tsx
'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function DashboardFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const fromVal = searchParams.get('from') || ''
    const toVal = searchParams.get('to') || ''
    const preset = searchParams.get('preset') || ''

    const setDateRange = (from: string, to: string, presetName?: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (from) params.set('from', from)
        else params.delete('from')

        if (to) params.set('to', to)
        else params.delete('to')

        if (presetName) params.set('preset', presetName)
        else params.delete('preset')

        params.delete('page')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handlePresetClick = (type: 'today' | '7days' | '30days' | 'this_month' | 'all') => {
        const today = new Date()
        const formatDate = (d: Date) => d.toISOString().split('T')[0]

        if (type === 'today') {
            const dateStr = formatDate(today)
            setDateRange(dateStr, dateStr, 'today')
        } else if (type === '7days') {
            const past = new Date()
            past.setDate(today.getDate() - 7)
            setDateRange(formatDate(past), formatDate(today), '7days')
        } else if (type === '30days') {
            const past = new Date()
            past.setDate(today.getDate() - 30)
            setDateRange(formatDate(past), formatDate(today), '30days')
        } else if (type === 'this_month') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            setDateRange(formatDate(startOfMonth), formatDate(today), 'this_month')
        } else if (type === 'all') {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('from')
            params.delete('to')
            params.delete('preset')
            params.delete('page')
            router.push(`${pathname}?${params.toString()}`)
        }
    }

    const activeBtnClass = "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
    const inactiveBtnClass = "text-muted-foreground hover:text-foreground hover:bg-muted"

    return (
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl glass border border-border shadow-sm">
            {/* Quick Presets */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => handlePresetClick('today')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        preset === 'today' ? activeBtnClass : inactiveBtnClass
                    }`}
                >
                    Today
                </button>
                <button
                    onClick={() => handlePresetClick('7days')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        preset === '7days' ? activeBtnClass : inactiveBtnClass
                    }`}
                >
                    7 Days
                </button>
                <button
                    onClick={() => handlePresetClick('30days')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        preset === '30days' ? activeBtnClass : inactiveBtnClass
                    }`}
                >
                    30 Days
                </button>
                <button
                    onClick={() => handlePresetClick('this_month')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        preset === 'this_month' ? activeBtnClass : inactiveBtnClass
                    }`}
                >
                    This Month
                </button>
                <button
                    onClick={() => handlePresetClick('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        !fromVal && !toVal ? activeBtnClass : inactiveBtnClass
                    }`}
                >
                    All Time
                </button>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block mx-1"></div>

            {/* Custom Date Pickers */}
            <div className="flex items-center gap-1.5">
                <input
                    type="date"
                    value={fromVal}
                    onChange={(e) => setDateRange(e.target.value, toVal)}
                    className="bg-card border border-border text-foreground px-2.5 py-1 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <span className="text-muted-foreground text-xs font-bold">to</span>
                <input
                    type="date"
                    value={toVal}
                    onChange={(e) => setDateRange(fromVal, e.target.value)}
                    className="bg-card border border-border text-foreground px-2.5 py-1 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
            </div>
        </div>
    )
}