// app/(dashboard)/layout.tsx
'use client' // 👈 onClick အလုပ်လုပ်ရန် Client Component အဖြစ် ပြောင်းလဲပါသည်

import React from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react' // 👈 NextAuth ရဲ့ signOut function ကို import ခေါ်ပါ

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 🚪 စနစ်မှထွက်ပြီး Login Page သို့ အော်တို ပြန်မောင်းထုတ်မည့် function
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">

            {/* ၁။ SIDEBAR (ဘယ်ဘက် Navigation Menu) */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
                <div>
                    {/* Logo / ဆိုင်အမည် */}
                    <div className="p-5 text-xl font-bold tracking-wider border-b border-slate-800 flex items-center gap-2">
                        🍕 <span className="text-orange-500">မြန်မာ့ရသာ</span> Admin
                    </div>

                    {/* Menu ခလုတ်များ */}
                    <nav className="p-4 space-y-1">
                        <Link href="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white">
                            🛒 <span className="text-sm font-medium">အော်ဒါများ (Orders)</span>
                        </Link>
                        <Link href="/categories" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white">
                            📂 <span className="text-sm font-medium">မီနူးအုပ်စု (Categories)</span>
                        </Link>
                        <Link href="/menu" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white">
                            🍔 <span className="text-sm font-medium">စားစရာများ (Menu)</span>
                        </Link>
                        <Link href="/addons" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white">
                            ➕ <span className="text-sm font-medium">အပိုပစ္စည်းများ (Addons)</span>
                        </Link>
                        <Link href="/discounts" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white">
                            🏷️ <span className="text-sm font-medium">လျှော့စျေး (Discounts)</span>
                        </Link>
                        <Link href="/tables" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white">
                            🍽️ <span className="text-sm font-medium">စားပွဲများ (Tabels)</span>
                        </Link>
                        <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white">
                            ⚙️ <span className="text-sm font-medium">ဆက်တင် (Settings)</span>
                        </Link>
                    </nav>
                </div>

                {/* 🎯 Sidebar အောက်ခြေရှိ အက်ဒမင် ပရိုဖိုင် နှင့် Logout ခလုတ် */}
                <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                            ကမ
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">ကိုမောင်မောင်</p>
                            <p className="text-xs text-gray-400">Manager</p>
                        </div>
                    </div>

                    {/* 🚀 ထည့်သွင်းလိုက်သော Logout ခလုတ် */}
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-slate-800 text-gray-400 hover:text-red-400 rounded-lg transition text-sm flex items-center gap-1 shrink-0"
                        title="စနစ်မှထွက်မည်"
                    >
                        🚪 <span className="text-xs font-semibold hidden lg:inline">ထွက်မည်</span>
                    </button>
                </div>
            </aside>

            {/* ၂။ MAIN CONTENT AREA (ညာဘက်ခြမ်းတစ်ခုလုံး) */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* TOP NAVBAR (အပေါ်ဘက်တန်း) */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        {/* ဖုန်းမျက်နှာပြင်အတွက် မီနူးဖွင့်ခလုတ် */}
                        <button className="md:hidden p-2 rounded hover:bg-gray-100 text-xl">☰</button>
                        <h1 className="text-md font-semibold text-gray-700 tracking-wide">ပင်မ Dashboard</h1>
                    </div>

                    {/* ညာဘက်ခြမ်း ဆိုင်အခြေအနေ Badge နှင့် Notification */}
                    <div className="flex items-center gap-4">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            အော်ဒါလက်ခံနေသည်
                        </span>
                        <button className="p-2 text-gray-500 hover:text-gray-700 relative text-lg">
                            🔔
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* စာမျက်နှာအလိုက် ပြောင်းလဲမည့် Page Content များ ဤနေရာသို့ ဝင်လာမည် */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>

        </div>
    )
}