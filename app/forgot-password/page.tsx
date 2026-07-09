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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-3xl">📧</div>
                    <h1 className="text-xl font-black text-white uppercase tracking-wider">Forgot Password</h1>
                    <p className="text-xs text-slate-400">
                        အကောင့်ဖွင့်ထားသည့် အီးမေးလ်ကို ရိုက်ထည့်ပါ။<br />
                        စကားဝှက်ပြင်ရန် လင့်ခ် ပေးပို့ပေးပါမည်။
                    </p>
                </div>

                {/* Error Alert */}
                {message?.error && (
                    <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                        ⚠️ {message.error}
                    </div>
                )}

                {/* Success Alert */}
                {message?.success && (
                    <div className="bg-green-950/50 border border-green-800 text-green-400 text-xs p-3.5 rounded-xl font-medium">
                        ✅ {message.success}
                    </div>
                )}

                {/* Form — success ဖြစ်ပြီးမှ form ဖျောက်မည် */}
                {!message?.success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">
                                အီးမေးလ် (Email Address)
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-md disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-2 mt-2"
                        >
                            {isPending ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>ပို့ဆောင်နေသည်...</span>
                                </>
                            ) : (
                                "📧 Reset Link တောင်းဆိုမည်"
                            )}
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div className="text-center pt-2 border-t border-slate-900">
                    <Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
                        အကောင့်ရှိပြီးသားလား? <span className="text-orange-500 font-bold hover:underline">Login ဝင်ရန်</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}
