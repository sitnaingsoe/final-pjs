// app/(auth)/reset-password/page.tsx
'use client'

import React, { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/server/actions/auth'

// 💡 အဓိက Form Component ကို သီးသန့်ခွဲထုတ်ခြင်း (useSearchParams လိုသောကြောင့်)
function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') // 👈 URL ထဲက Token ကို ယူခြင်း

    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ success?: string; error?: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setMessage({ error: "စကားဝှက်နှစ်ခု ထပ်တူမကျပါ" })
            return
        }

        if (!token) {
            setMessage({ error: "Token ပျောက်ဆုံးနေပါသည်။ Link ကို ပြန်စစ်ပါ။" })
            return
        }

        setMessage(null)
        startTransition(async () => {
            const res = await resetPassword(token, password)
            setMessage(res)
            if (res.success) {
                // 3 seconds ကြာပြီးမှ Login page သို့ ပြန်ညွှန်းမည်
                setTimeout(() => { router.push('/login') }, 3000)
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-3xl">🔒</div>
                    <h1 className="text-xl font-black text-white uppercase tracking-wider">Reset Password</h1>
                    <p className="text-xs text-slate-400">သင်၏ အကောင့်အတွက် စကားဝှက်အသစ် သတ်မှတ်ပါ</p>
                </div>

                {/* Token မရှိပါက Warning */}
                {!token && (
                    <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                        ⚠️ Reset token ပျောက်ဆုံးနေပါသည်။ Forgot Password page မှ ထပ်မံ တောင်းဆိုပါ။
                    </div>
                )}

                {/* Error / Success Alert */}
                {message?.error && (
                    <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                        ⚠️ {message.error}
                    </div>
                )}
                {message?.success && (
                    <div className="bg-green-950/50 border border-green-800 text-green-400 text-xs p-3.5 rounded-xl font-medium">
                        🎉 {message.success} <span className="text-slate-500">(Login page သို့ ပြန်ညွှန်းနေသည်...)</span>
                    </div>
                )}

                {/* Form — Token ရှိမှသာ ပြမည် */}
                {token && !message?.success && (
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">
                                စကားဝှက်အသစ် (New Password)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full border border-slate-800 rounded-xl p-3 pr-10 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                                    required
                                    minLength={6}
                                    disabled={isPending}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition text-sm"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">
                                စကားဝှက်အသစ် ထပ်မံရိုက်ပါ (Confirm Password)
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    className="w-full border border-slate-800 rounded-xl p-3 pr-10 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                                    required
                                    disabled={isPending}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition text-sm"
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
                                    <span>လုပ်ဆောင်နေသည်...</span>
                                </>
                            ) : (
                                "🔒 စကားဝှက် အသစ်လဲမည်"
                            )}
                        </button>
                    </form>
                )}

                {/* Back to Forgot Password */}
                <div className="text-center pt-2 border-t border-slate-900">
                    <a href="/forgot-password" className="text-xs text-slate-400 hover:text-white transition">
                        Link ထပ်တောင်းရန် <span className="text-orange-500 font-bold hover:underline">Forgot Password</span>
                    </a>
                </div>

            </div>
        </div>
    )
}

// 🎯 Next.js Client Component တွင် useSearchParams ပါက Suspense ဖြင့် မဖြစ်မနေ ပတ်ပေးရပါသည်
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="text-white text-center min-h-screen flex items-center justify-center bg-slate-900">
                <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}

