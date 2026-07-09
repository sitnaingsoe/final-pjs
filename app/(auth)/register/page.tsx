// app/(auth)/register/page.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerCompanyOwner } from '@/server/actions/register'

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // Client-side password match validation ပြုလုပ်ပြီးမှ submit လုပ်မည်
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError("လျှို့ဝှက်နံပါတ်နှစ်ခု ထပ်တူမကျပါ")
            return
        }

        startTransition(async () => {
            setError(null)
            const res = await registerCompanyOwner(formData)

            if (res && !res.success) {
                setError(res.error || "အကောင့်ဖွင့်၍ မရပါ")
            } else {
                router.push('/login')
            }
        })
    }

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
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ကုမ္ပဏီ/လုပ်ငန်းအမည် */}
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

                    {/* လျှို့ဝှက်နံပါတ် + Show/Hide */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">လျှို့ဝှက်နံပါတ် (Password)</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                className="w-full border border-slate-800 rounded-xl p-3 pr-11 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                                required
                                minLength={6}
                                disabled={isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition text-base select-none"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* လျှို့ဝှက်နံပါတ် ထပ်မံရိုက်ပါ (Confirm Password) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">လျှို့ဝှက်နံပါတ်ထပ်မံရိုက်ပါ (Confirm Password)</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="••••••••"
                                className="w-full border border-slate-800 rounded-xl p-3 pr-11 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                                required
                                disabled={isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition text-base select-none"
                                tabIndex={-1}
                                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                            >
                                {showConfirm ? '🙈' : '👁️'}
                            </button>
                        </div>
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