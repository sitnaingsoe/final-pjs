// app/(auth)/register/page.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerCompanyOwner } from '@/server/actions/register' // 👈 Action သစ်ကို ပြောင်းသုံးပါသည်

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-3xl">🏢</div>
                    <h1 className="text-xl font-black text-white uppercase tracking-wider">Owner Registration</h1>
                    <p className="text-xs text-slate-400">လုပ်ငန်းစုစနစ်အသစ် စတင်ရန်နှင့် ပိုင်ရှင်အကောင့်ဆောက်ရန်</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form
                    action={(formData) => {
                        startTransition(async () => {
                            setError(null)
                            const res = await registerCompanyOwner(formData)

                            if (res && !res.success) {
                                setError(res.error || "အကောင့်ဖွင့်၍ မရပါ")
                            } else {
                                // အောင်မြင်လျှင် Login ဝင်ခိုင်းမည်
                                router.push('/login')
                            }
                        })
                    }}
                    className="space-y-4"
                >
                    {/* 🎯 ကုမ္ပဏီ/လုပ်ငန်းအမည် (Company Name) - မဖြစ်မနေ လိုအပ်သည် */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">လုပ်ငန်း/ကုမ္ပဏီအမည် (Business/Company Name)</label>
                        <input
                            type="text"
                            name="companyName"
                            placeholder="ဥပမာ - BiteCraft Food Group"
                            className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* ပိုင်ရှင်အမည် */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">ပိုင်ရှင်အမည် (Owner Name)</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="ဥပမာ - ဦးကျော်ကျော်"
                            className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                            disabled={isPending}
                        />
                    </div>

                    {/* အီးမေးလ် */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">အီးမေးလ် (Owner Email)</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="owner@bitecraft.com"
                            className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* လျှို့ဝှက်နံပါတ် */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">လျှို့ဝှက်နံပါတ် (Password)</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-md disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-2 mt-2"
                    >
                        {isPending ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>စနစ်ပြင်ဆင်နေသည်...</span>
                            </>
                        ) : (
                            "🚀 ကုမ္ပဏီနှင့် အကောင့်ဆောက်မည်"
                        )}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-900">
                    <Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
                        အကောင့်ရှိပြီးသားလား? <span className="text-orange-500 font-bold hover:underline">Login ဝင်ရန်</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}