// app/forgot-password/page.tsx
'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from '@/server/actions/auth'

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ success?: string; error?: string } | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string

        setMessage(null)
        startTransition(async () => {
            const res = await sendPasswordResetEmail(email)
            setMessage(res)
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-black/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-black tracking-tight uppercase">Forgot Password</h1>
                        <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
                            အကောင့်ဖွင့်ထားသည့် အီးမေးလ်ကို ရိုက်ထည့်ပါ။<br />
                            စကားဝှက်ပြင်ရန် လင့်ခ် ပေးပို့ပေးပါမည်။
                        </p>
                    </div>
                </div>

                {/* Error Alert */}
                {message?.error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{message.error}</span>
                    </div>
                )}

                {/* Success Alert */}
                {message?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-2xl font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                        <span>{message.success}</span>
                    </div>
                )}

                {/* Form — success ဖြစ်ပြီးမှ form ဖျောက်မည် */}
                {!message?.success && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">
                                အီးမေးလ် (Email Address)
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
                                disabled={isPending}
                            />
                        </div>

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
                                    <span>ပို့ဆောင်နေသည်...</span>
                                </>
                            ) : (
                                <>
                                    <span>Reset Link တောင်းဆိုမည်</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div className="text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        အကောင့်ရှိပြီးသားလား?{' '}
                        <Link href="/login" className="text-black font-bold hover:underline transition-all">
                            Login ဝင်ရန်
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}
