// app/(auth)/login/page.tsx
'use client'

import React, { useState, useTransition, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signOut, signIn } from 'next-auth/react'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlError = searchParams.get('error')
    
    const [error, setError] = useState<string | null>(
        urlError === 'account_deactivated' ? "သင့်အကောင့်ကို ပိတ်ထားပါသည်။" : null
    )
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (urlError === 'account_deactivated') {
            // Token များကို ဖျက်ပစ်မည်
            localStorage.removeItem('accessToken')
            signOut({ redirect: false })
        }
    }, [urlError])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-3xl">🔑</div>
                    <h1 className="text-xl font-black text-black uppercase tracking-wider">Sign In</h1>
                    <p className="text-xs text-gray-500">BiteCraft Restaurant OS စနစ်ထဲသို့ ဝင်ရောက်ရန်</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {/* Login Form */}
                <form action={(formData) => {
                    startTransition(async () => {
                        setError(null)
                        
                        const email = formData.get('email') as string
                        const password = formData.get('password') as string

                        // 1. Get Custom Access & Refresh Tokens
                        let apiData;
                        try {
                            const apiRes = await fetch('/api/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            })
                            apiData = await apiRes.json()

                            if (!apiRes.ok || !apiData.success) {
                                setError(apiData.error || "API Login Failed")
                                return
                            }

                            // Save Access Token
                            localStorage.setItem('accessToken', apiData.accessToken)
                            
                        } catch (err) {
                            setError("Network Error: Could not connect to API")
                            return
                        }

                        // 2. Establish NextAuth Session (Client Side API call avoids Server Action Vercel bugs)
                        const res = await signIn("credentials", {
                            email,
                            password,
                            redirect: false,
                        })

                        if (res?.error) {
                            setError("အကောင့်ဝင်၍ မရပါ: " + res.error)
                        } else {
                            // 🎯 Role အပေါ်မူတည်ပြီး မတူညီသော Dashboard သို့ ညွှန်းမည်
                            if (apiData.user?.role === 'COMPANY_HEAD') {
                                window.location.href = '/dashboard/hq/branches'
                            } else if (apiData.user?.role === 'STAFF') {
                                window.location.href = '/pos'
                            } else {
                                window.location.href = '/dashboard/store/orders' // Default to orders page
                            }
                        }
                    })
                }} className="space-y-4">


                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">အီးမေးလ် (Email Address)</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-gray-50 text-black placeholder-gray-400"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold text-gray-500">လျှို့ဝှက်နံပါတ် (Password)</label>
                            <Link href="/forgot-password" className="text-xs text-black hover:underline">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl p-3 pr-11 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-gray-50 text-black placeholder-gray-400"
                                required
                                disabled={isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition text-base select-none"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-black hover:bg-gray-800 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-md disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 mt-2"
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
                <div className="text-center pt-2 border-t border-gray-100">
                    <Link href="/register" className="text-xs text-gray-500 hover:text-black transition">
                        လုပ်ငန်းအသစ် စတင်မှာလား? <span className="text-black font-bold hover:underline">ကုမ္ပဏီအကောင့်ဆောက်ရန်</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}