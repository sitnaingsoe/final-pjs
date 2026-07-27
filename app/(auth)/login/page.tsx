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
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (urlError === 'account_deactivated') {
            // Token များကို ဖျက်ပစ်မည်
            localStorage.removeItem('accessToken')
            signOut({ redirect: false })
        }
    }, [urlError])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-black/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-black tracking-tight">Sign In</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">BiteCraft Restaurant OS စနစ်ထဲသို့ ဝင်ရောက်ရန်</p>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{error}</span>
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
                            setIsSuccess(true)
                            setTimeout(() => {
                                // 🎯 Role အပေါ်မူတည်ပြီး မတူညီသော Dashboard သို့ ညွှန်းမည်
                                if (apiData.user?.role === 'COMPANY_HEAD') {
                                    window.location.href = '/dashboard/hq/branches'
                                } else if (apiData.user?.role === 'STAFF') {
                                    window.location.href = '/pos'
                                } else {
                                    window.location.href = '/dashboard/store/orders' // Default to orders page
                                }
                            }, 1000)
                        }
                    })
                }} className="space-y-5">


                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">အီးမေးလ် (Email Address)</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">လျှို့ဝှက်နံပါတ် (Password)</label>
                            <Link href="/forgot-password" className="text-xs font-bold text-gray-500 hover:text-black transition-colors">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending || isSuccess}
                        className={`group relative w-full text-white text-sm font-bold py-4 rounded-xl transition-all overflow-hidden flex items-center justify-center gap-2 mt-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${isSuccess ? 'bg-green-600' : 'bg-black'}`}
                    >
                        {!isSuccess && !isPending && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        )}
                        {isSuccess ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>အကောင့်ဝင်ခြင်း အောင်မြင်ပါသည်</span>
                            </>
                        ) : isPending ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>စစ်ဆေးနေသည်...</span>
                            </>
                        ) : (
                            <>
                                <span>စနစ်ထဲသို့ ဝင်မည်</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        လုပ်ငန်းအသစ် စတင်မှာလား?{' '}
                        <Link href="/register" className="text-black font-bold hover:underline transition-all">
                            ကုမ္ပဏီအကောင့်ဆောက်ရန်
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-medium">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}