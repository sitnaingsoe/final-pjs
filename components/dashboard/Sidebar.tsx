'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react' // 💡 Session ထဲက role ကို ယူရန်

export default function Sidebar() {
    const { data: session } = useSession()
    const pathname = usePathname()

    const role = session?.user?.role

    // 🎯 Role အပေါ်မူတည်ပြီး ပြမည့် Menu Links များကို ဆုံးဖြတ်ခြင်း
    const links = role === 'COMPANY_HEAD'
        ? [
            { name: "📊 Overview", path: "/dashboard" },
            { name: "🏢 ဆိုင်ခွဲများစီမံရန်", path: "/dashboard/company/branches" },
        ]
        : [
            { name: "🍔 ဆိုင်ခွဲချုပ်", path: "/dashboard" },
            { name: "📦 အော်ဒါများ (Orders)", path: "/dashboard/orders" },
            { name: "🍟 မီနူးစီမံရန် (Menu)", path: "/dashboard/menu" },
            { name: "🪑 စားပွဲဝိုင်းများ (Tables)", path: "/dashboard/tables" },
            { name: "⚙️ ဆိုင်ခွဲ Settings", path: "/dashboard/settings" },
        ]

    return (
        <div className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 p-4 space-y-6 text-white">
            {/* App Logo */}
            <div className="px-2 py-4 border-b border-slate-900">
                <h2 className="text-lg font-black text-orange-500 uppercase tracking-widest">BiteCraft OS</h2>
                <p className="text-3xs text-slate-500 font-bold uppercase mt-0.5">
                    Role: <span className="text-slate-300">{role || 'Loading...'}</span>
                </p>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5">
                {links.map((link) => {
                    const isActive = pathname === link.path
                    return (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={`flex items-center px-4 py-3 text-xs font-bold rounded-xl transition ${isActive
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                }`}
                        >
                            {link.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}