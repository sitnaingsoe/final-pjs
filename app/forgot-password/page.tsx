// app/forgot-password/page.tsx
'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from '@/server/actions/auth' // 👈 စောစောက ဆောက်ခဲ့တဲ့ action

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ success?: string; error?: string } | null>(null)

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">စကားဝှက် မေ့နေပါသလား 🔑</h2>
                    <p className="text-sm text-gray-500 mt-1">အကောင့်ဖွင့်ထားသည့် အီးမေးလ်ကို ရိုက်ထည့်ပါ။ စကားဝှက်ပြင်ရန် လင့်ခ်ပို့ပေးပါမည်။</p>
                </div>

                {message?.error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 font-medium">
                        ⚠️ {message.error}
                    </div>
                )}
                {message?.success && (
                    <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 font-medium">
                        ✅ {message.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">အီးမေးလ် (Email Address)</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@gmail.com"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-black focus:outline-none focus:border-orange-500 "
                            required
                            disabled={isPending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 rounded-lg transition disabled:bg-gray-400"
                    >
                        {isPending ? 'ပို့ဆောင်နေပါသည်...' : 'လင့်ခ် တောင်းဆိုမည်'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/login" className="text-sm text-orange-500 hover:underline font-medium">
                        🔙 အကောင့်ဝင်ရန် စာမျက်နှာသို့ ပြန်သွားမည်
                    </Link>
                </div>
            </div>
        </div>
    )
}