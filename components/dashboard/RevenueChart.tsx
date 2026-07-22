// components/dashboard/RevenueChart.tsx
'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ChartData {
    name: string
    revenue: number
}

export default function RevenueChart({ data }: { data: ChartData[] }) {
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => { setMounted(true) }, [])

    return (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl space-y-4">
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">📊 Branch Revenue Analytics</h3>
                <p className="text-3xs text-gray-400 font-bold uppercase mt-0.5">ဆိုင်ခွဲများအလိုက် ရောင်းအားနှိုင်းယှဉ်ချက် ဂရပ်</p>
            </div>

            {/* Recharts Container */}
            <div className="w-full h-64 text-2xs font-mono flex items-center justify-center">
                {!mounted ? (
                    <div className="text-gray-400 animate-pulse">Loading Chart...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}