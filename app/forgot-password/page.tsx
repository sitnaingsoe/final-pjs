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
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-3xl">📧</div>
                    <h1 className="text-xl font-black text-black uppercase tracking-wider">Forgot Password</h1>
                    <p className="text-xs text-gray-500">
                        အကောင့်ဖွင့်ထားသည့် အီးမေးလ်ကို ရိုက်ထည့်ပါ။<br />
                        စကားဝှက်ပြင်ရန် လင့်ခ် ပေးပို့ပေးပါမည်။
                    </p>
                </div>

                {/* Error Alert */}
                {message?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
                        ⚠️ {message.error}
                    </div>
                )}

                {/* Success Alert */}
                {message?.success && (
                    <div className="bg-green-950/50 border border-green-200 text-green-600 text-xs p-3.5 rounded-xl font-medium">
                        ✅ {message.success}
                    </div>
                )}

                {/* Form — success ဖြစ်ပြီးမှ form ဖျောက်မည် */}
                {!message?.success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">
                                အီးမေးလ် (Email Address)
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-gray-50 text-black placeholder-gray-400"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-black hover:bg-gray-800 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-md disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 mt-2"
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
                <div className="text-center pt-2 border-t border-gray-100">
                    <Link href="/login" className="text-xs text-gray-500 hover:text-black transition">
                        အကောင့်ရှိပြီးသားလား? <span className="text-black font-bold hover:underline">Login ဝင်ရန်</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}
