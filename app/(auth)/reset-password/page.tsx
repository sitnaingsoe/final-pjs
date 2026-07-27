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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-black/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-black tracking-tight uppercase">Reset Password</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">သင်၏ အကောင့်အတွက် စကားဝှက်အသစ် သတ်မှတ်ပါ</p>
                    </div>
                </div>

                {/* Token မရှိပါက Warning */}
                {!token && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl font-medium flex gap-3 animate-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span className="leading-relaxed">Reset token ပျောက်ဆုံးနေပါသည်။ Forgot Password page မှ ထပ်မံ တောင်းဆိုပါ။</span>
                    </div>
                )}

                {/* Error / Success Alert */}
                {message?.error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{message.error}</span>
                    </div>
                )}
                {message?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-2xl font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                        <span>{message.success} <span className="text-gray-500 text-xs ml-2">(Login page သို့ ပြန်ညွှန်းနေသည်...)</span></span>
                    </div>
                )}

                {/* Form — Token ရှိမှသာ ပြမည် */}
                {token && !message?.success && (
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">
                                စကားဝှက်အသစ် (New Password)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    required
                                    minLength={6}
                                    disabled={isPending}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">
                                စကားဝှက်အသစ် ထပ်မံရိုက်ပါ (Confirm Password)
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    required
                                    disabled={isPending}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showConfirm ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative w-full bg-black text-white text-sm font-bold py-4 rounded-xl transition-all overflow-hidden flex items-center justify-center gap-2 mt-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                        >
                            {!isPending && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            )}
                            {isPending ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>လုပ်ဆောင်နေသည်...</span>
                                </>
                            ) : (
                                <>
                                    <span>စကားဝှက် အသစ်လဲမည်</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Back to Forgot Password */}
                <div className="text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Link ထပ်တောင်းရန်{' '}
                        <a href="/forgot-password" className="text-black font-bold hover:underline transition-all">
                            Forgot Password
                        </a>
                    </p>
                </div>

            </div>
        </div>
    )
}

// 🎯 Next.js Client Component တွင် useSearchParams ပါက Suspense ဖြင့် မဖြစ်မနေ ပတ်ပေးရပါသည်
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="text-black text-center min-h-screen flex items-center justify-center bg-gray-50">
                <span className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></span>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}

