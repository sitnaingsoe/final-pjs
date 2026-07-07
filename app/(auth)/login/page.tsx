// app/(auth)/login/page.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/server/actions/auth' // 👈 Login Action ကို လှမ်းခေါ်ခြင်း

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-3xl">🔑</div>
                    <h1 className="text-xl font-black text-white uppercase tracking-wider">Sign In</h1>
                    <p className="text-xs text-slate-400">BiteCraft Restaurant OS စနစ်ထဲသို့ ဝင်ရောက်ရန်</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {/* Login Form */}
                <form action={(formData) => {
                    startTransition(async () => {
                        setError(null)
                        const res = await loginUser(formData)

                        if (res && !res.success) {
                            setError(res.error || "အကောင့်ဝင်၍ မရပါ")
                        } else {
                            router.push('/dashboard')
                        }
                    })
                }} className="space-y-4">

                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">အီးမေးလ် (Email Address)</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold text-slate-400">လျှို့ဝှက်နံပါတ် (Password)</label>
                            <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline">
                                Forgot?
                            </Link>
                        </div>
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
                                <span>စစ်ဆေးနေသည်...</span>
                            </>
                        ) : (
                            "🔑 စနစ်ထဲသို့ ဝင်မည်"
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="text-center pt-2 border-t border-slate-900">
                    <Link href="/register" className="text-xs text-slate-400 hover:text-white transition">
                        လုပ်ငန်းအသစ် စတင်မှာလား? <span className="text-orange-500 font-bold hover:underline">ကုမ္ပဏီအကောင့်ဆောက်ရန်</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}