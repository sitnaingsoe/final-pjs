// app/reset-password/page.tsx
'use client'

import React, { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/server/actions/auth'

// 💡 အဓိက Form Component ကို သီးသန့်ခွဲထုတ်ခြင်း
function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') // 👈 URL ထဲက Token ကို ယူခြင်း

    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ success?: string; error?: string } | null>(null)

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setMessage({ error: "စကားဝှက်နှစ်ခု ထပ်တူမကျပါဗျာ" })
            return
        }

        if (!token) {
            setMessage({ error: "Token ပျောက်ဆုံးနေပါသည်" })
            return
        }

        setMessage(null)
        startTransition(async () => {
            const res = await resetPassword(token, password)
            setMessage(res)
            if (res.success) {
                setTimeout(() => { router.push('/login') }, 3000)
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-950 rounded-2xl shadow-xl p-6 border border-slate-800">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">စကားဝှက်အသစ် သတ်မှတ်ရန် 🔒</h2>
                    <p className="text-sm text-slate-400 mt-1">သင်၏ အကောင့်အတွက် စကားဝှက်အသစ်ကို ရိုက်ထည့်ပေးပါ</p>
                </div>

                {message?.error && <div className="bg-red-950 border border-red-800 text-red-400 text-sm p-3 rounded-lg mb-4">⚠️ {message.error}</div>}
                {message?.success && <div className="bg-green-950 border border-green-800 text-green-400 text-sm p-3 rounded-lg mb-4">🎉 {message.success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">စကားဝှက်အသစ် (New Password)</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500"
                            required
                            minLength={6}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">စကားဝှက်အသစ်ကို ထပ်မံရိုက်ပါ</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-lg transition disabled:bg-slate-800"
                    >
                        {isPending ? 'လုပ်ဆောင်နေပါသည်...' : 'စကားဝှက် အသစ်လဲမည်'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// 🎯 Next.js Client Component တွင် useSearchParams ပါက Suspense ဖြင့် မဖြစ်မနေ ပတ်ပေးရပါသည်
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-white text-center min-h-screen flex items-center justify-center bg-slate-900">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}