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
        
        // Refresh Token ကို ဖျက်ရန် API ခေါ်မည်
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
            console.error("Logout API failed", e)
        }

        // NextAuth Session ရှင်းမည်
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

        ]
        : [
            { name: "ပင်မ Dashboard", path: "/dashboard/store", icon: "🍔" },
            { name: "အော်ဒါများ (Orders)", path: "/dashboard/store/orders", icon: "🛒" },
            { name: "မီနူးအုပ်စု (Categories)", path: "/dashboard/store/categories", icon: "📂" },
            { name: "စားစရာများ (Menu)", path: "/dashboard/store/menu", icon: "🍔" },
            { name: "အပိုပစ္စည်းများ (Addons)", path: "/dashboard/store/addons", icon: "➕" },
            { name: "လျှော့စျေး (Discounts)", path: "/dashboard/store/discounts", icon: "🏷️" },
            { name: "စားပွဲများ (Tables)", path: "/dashboard/store/tables", icon: "🍽️" },
            { name: "ဝန်ထမ်းများ (Staffs)", path: "/dashboard/store/staff", icon: "👥" },

            { name: "ဆက်တင် (Settings)", path: "/dashboard/store/settings", icon: "⚙️" },
        ]

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    // Session ဆွဲနေတုန်း UI ဗလာမဖြစ်အောင် loading ပြခြင်း
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-black">
                <span className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></span>
            </div>
        )
    }

    const navigationLinks = (
        <nav className="p-4 space-y-1">
            {links.map((link) => {
                const isActive = pathname === link.path

                return (
                    <Link
                        key={link.path}
                        href={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition text-xs font-bold ${isActive
                            ? 'bg-black text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                            }`}
                    >
                        <span>{link.icon}</span>
                        <span>{link.name}</span>
                    </Link>
                )
            })}
        </nav>
    )

    const sidebarFooter = (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-2 bg-white">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center font-black text-white text-xs shrink-0 uppercase">
                    {userName.substring(0, 2)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate text-gray-800">{userName}</p>
                    <p className="text-3xs text-gray-400 font-black uppercase tracking-wider">{role || 'STAFF'}</p>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-50 text-gray-500 hover:text-red-600 rounded-xl transition text-sm flex items-center gap-1 shrink-0"
                title="စနစ်မှထွက်မည်"
            >
                🚪 <span className="text-2xs font-bold hidden lg:inline">ထွက်မည်</span>
            </button>
        </div>
    )

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden relative">

            {/* ၁။ SIDEBAR (Desktop View) */}
            <aside className="w-64 bg-white text-black flex flex-col justify-between hidden md:flex border-r border-gray-200">
                <div>
                    <div className="p-5 text-lg font-black tracking-wider border-b border-gray-100 flex items-center gap-2">
                        🍕 <span className="text-black uppercase">BiteCraft OS</span>
                    </div>
                    {navigationLinks}
                </div>
                {sidebarFooter}
            </aside>

            {/* ၂။ MOBILE DRAWER (Mobile View Navigation Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <aside className="relative w-64 bg-white text-black flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
                        <div>
                            <div className="p-5 text-lg font-black tracking-wider border-b border-gray-100 flex items-center justify-between">
                                <span className="flex items-center gap-2">🍕 BiteCraft OS</span>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="p-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500"
                                >
                                    ✕
                                </button>
                            </div>
                            {navigationLinks}
                        </div>
                        {sidebarFooter}
                    </aside>
                </div>
            )}

            {/* ၃။ MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

                {/* TOP NAVBAR */}
                <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-xl text-gray-800 transition-colors"
                            aria-label="Open menu"
                        >
                            ☰
                        </button>
                        <h1 className="text-sm font-bold text-gray-700 tracking-wide uppercase">
                            {role === 'COMPANY_HEAD' ? '🏢 Central Control' : '🏪 Branch Operation'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="bg-green-50 border border-green-200 text-green-600 text-2xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Live System Connected
                        </span>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
                    {children}
                </main>
            </div>

        </div>
    )
}