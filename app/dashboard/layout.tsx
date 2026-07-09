'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react' // 💡 Session ယူရန် useSession ပါတွဲသုံးပါသည်

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const pathname = usePathname()

    const role = session?.user?.role
    const userName = session?.user?.name || 'ဝန်ထမ်း'

    // 🚪 စနစ်မှထွက်ပြီး Login Page သို့ ပြန်မောင်းထုတ်မည့် function
    const handleLogout = async () => {
        // Custom JWT Access Token ကို ရှင်းလင်းမည်
        localStorage.removeItem('accessToken')
        await signOut({ callbackUrl: '/login' })
    }

    // 🎯 Role အပေါ်မူတည်ပြီး လမ်းကြောင်းသစ်များ (dashboard/...) ခွဲခြားသတ်မှတ်ခြင်း
    const links = role === 'COMPANY_HEAD'
        ? [
            { name: "Overview Dashboard", path: "/dashboard/hq", icon: "🏢" },
            { name: "ဆိုင်ခွဲများစီမံရန် (Branches)", path: "/dashboard/hq/branches", icon: "🏪" },
            { name: "ဘေလ်မှတ်တမ်းများ (Invoices)", path: "/dashboard/hq/invoices", icon: "🧾" },
            { name: "ဝန်ထမ်းများစီမံရန် (Staffs)", path: "/dashboard/hq/staff", icon: "👥" },         
            { name: "ဗဟိုမီနူး (Master Menu)", path: "/dashboard/hq/menu", icon: "🍔" },
            { name: "ကုန်ကြမ်းလက်ကျန် (Inventory)", path: "/dashboard/hq/inventory", icon: "⚠️" }
        ]
        : [
            { name: "ပင်မ Dashboard", path: "/dashboard/store", icon: "🍔" },
            { name: "အော်ဒါများ (Orders)", path: "/dashboard/store/orders", icon: "🛒" },
            { name: "မီနူးအုပ်စု (Categories)", path: "/dashboard/store/categories", icon: "📂" },
            { name: "စားစရာများ (Menu)", path: "/dashboard/store/menu", icon: "🍔" },
            { name: "အပိုပစ္စည်းများ (Addons)", path: "/dashboard/store/addons", icon: "➕" },
            { name: "လျှော့စျေး (Discounts)", path: "/dashboard/store/discounts", icon: "🏷️" },
            { name: "စားပွဲများ (Tables)", path: "/dashboard/store/tables", icon: "🍽️" },
            { name: "ဆက်တင် (Settings)", path: "/dashboard/store/settings", icon: "⚙️" },
        ]

    // Session ဆွဲနေတုန်း UI ဗလာမဖြစ်အောင် loading ပြခြင်း
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">

            {/* ၁။ SIDEBAR (ဘယ်ဘက် Navigation Menu) - Dark Mode Style */}
            <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between hidden md:flex border-r border-slate-800">
                <div>
                    {/* Logo / ဆိုင်အမည် */}
                    <div className="p-5 text-lg font-black tracking-wider border-b border-slate-900 flex items-center gap-2">
                        🍕 <span className="text-orange-500 uppercase">BiteCraft OS</span>
                    </div>

                    {/* Dynamic Menu ခလုတ်များ */}
                    <nav className="p-4 space-y-1">
                        {links.map((link) => {
                            // Link လမ်းကြောင်း တိကျစွာ ကိုက်ညီမှု ရှိမရှိ စစ်ခြင်း
                            const isActive = pathname === link.path

                            return (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition text-xs font-bold ${isActive
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                        }`}
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* 🎯 Sidebar အောက်ခြေရှိ အက်ဒမင် ပရိုဖိုင် နှင့် Logout ခလုတ် */}
                <div className="p-4 border-t border-slate-900 flex items-center justify-between gap-2 bg-slate-950">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center font-black text-white text-xs shrink-0 uppercase">
                            {userName.substring(0, 2)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate text-slate-200">{userName}</p>
                            <p className="text-3xs text-slate-500 font-black uppercase tracking-wider">{role || 'STAFF'}</p>
                        </div>
                    </div>

                    {/* 🚀 Logout ခလုတ် */}
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded-xl transition text-sm flex items-center gap-1 shrink-0"
                        title="စနစ်မှထွက်မည်"
                    >
                        🚪 <span className="text-2xs font-bold hidden lg:inline">ထွက်မည်</span>
                    </button>
                </div>
            </aside>

            {/* ၂။ MAIN CONTENT AREA (ညာဘက်ခြမ်းတစ်ခုလုံး) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">

                {/* TOP NAVBAR (အပေါ်ဘက်တန်း) - Dark Mode Accent */}
                <header className="h-16 bg-slate-950 flex items-center justify-between px-6 border-b border-slate-900">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 rounded-xl hover:bg-slate-900 text-xl">☰</button>
                        <h1 className="text-sm font-bold text-slate-300 tracking-wide uppercase">
                            {role === 'COMPANY_HEAD' ? '🏢 Central Control' : '🏪 Branch Operation'}
                        </h1>
                    </div>

                    {/* ညာဘက်ခြမ်း ဆိုင်အခြေအနေ Badge နှင့် Notification */}
                    <div className="flex items-center gap-4">
                        <span className="bg-green-950/40 border border-green-800 text-green-400 text-2xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Live System Connected
                        </span>
                    </div>
                </header>

                {/* စာမျက်နှာအလိုက် ပြောင်းလဲမည့် Page Content များ ဤနေရာသို့ ဝင်လာမည် */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6">
                    {children}
                </main>
            </div>

        </div>
    )
}