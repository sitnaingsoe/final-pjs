// app/(auth)/register/page.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // 👈 Next.js Client Routing အတွက် Link ကိုသုံးပါသည်
import { registerAdmin } from '@/server/actions/register'

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
            <div className="bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md space-y-6">

                {/* 🍕 Header Section */}
                <div className="text-center space-y-2">
                    <div className="text-3xl">👨‍ဟင်းချက်နည်း</div>
                    <h1 className="text-2xl font-black text-white tracking-wide">Backoffice Register</h1>
                    <p className="text-xs text-slate-400">စီမံခန့်ခွဲမှုစနစ်အတွက် အကောင့်အသစ်ဖွင့်ပါ</p>
                </div>

                {/* ⚠️ Error Alert */}
                {error && (
                    <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                        ⚠️ {error}
                    </div>
                )}

                {/* 📝 Form */}
                <form
                    action={(formData) => {
                        startTransition(async () => {
                            setError(null)
                            const res = await registerAdmin(formData)

                            if (res && !res.success) {
                                setError(res.error || "အကောင့်ဖွင့်၍ မရပါ")
                            } else {
                                router.push('/login')
                            }
                        })
                    }}
                    className="space-y-4"
                >
                    {/* Name Field */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">အမည် (Name) - <span className="text-slate-500 font-normal">မထည့်လည်းရသည်</span></label>
                        <input
                            type="text"
                            name="name"
                            placeholder="ဥပမာ - မောင်မောင်"
                            className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                            disabled={isPending}
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">အီးမေးလ် (Email)</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="admin@restaurant.com"
                            className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Password Field */}
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-md disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-2 mt-2"
                    >
                        {isPending ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>အကောင့်ဆောက်နေသည်...</span>
                            </>
                        ) : (
                            "🎯 အကောင့်အသစ်ဆောက်မည်"
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="text-center pt-2 border-t border-slate-900">
                    <Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
                        အကောင့်ရှိပြီးသားလား? <span className="text-orange-500 font-bold hover:underline">Login ဝင်ရန်</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}