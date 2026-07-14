// components/dashboard/BranchStatusChart.tsx
'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts'

interface ChartData {
    name: string
    orders: number
}

export default function BranchStatusChart({ data }: { data: ChartData[] }) {
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => { setMounted(true) }, [])

    return (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 flex flex-col h-full">
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">📊 Branch Activity (Status)</h3>
                <p className="text-3xs text-slate-500 font-bold uppercase mt-0.5">ဆိုင်ခွဲများအလိုက် အော်ဒါအရေအတွက် နှိုင်းယှဉ်ချက်</p>
            </div>

            {/* Recharts Container */}
            <div className="w-full h-64 text-2xs font-mono flex items-center justify-center">
                {!mounted ? (
                    <div className="text-slate-500 animate-pulse">Loading Chart...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
