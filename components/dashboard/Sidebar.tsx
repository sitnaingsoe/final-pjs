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
        <div className="w-64 min-h-screen bg-white border-r border-gray-200 p-4 space-y-6 text-black">
            {/* App Logo */}
            <div className="px-2 py-4 border-b border-gray-100">
                <h2 className="text-lg font-black text-black uppercase tracking-widest">BiteCraft OS</h2>
                <p className="text-3xs text-gray-400 font-bold uppercase mt-0.5">
                    Role: <span className="text-gray-700">{role || 'Loading...'}</span>
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
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
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