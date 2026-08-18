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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="animate-in fade-in zoom-in-95 duration-700 glass p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-border w-full max-w-md space-y-8 relative z-10">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-tr from-accent to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-accent/20 mb-4 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Owner Registration</h1>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">Create a new company account to get started.</p>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="animate-in slide-in-from-top-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-2xl font-medium flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ကုမ္ပဏီ/လုပ်ငန်းအမည် */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Business/Company Name</label>
                        <input
                            type="text"
                            name="companyName"
                            placeholder="e.g. BiteCraft Food Group"
                            className="w-full bg-background/50 border border-border rounded-xl p-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* ပိုင်ရှင်အမည် */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Owner Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. John Doe"
                            className="w-full bg-background/50 border border-border rounded-xl p-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            disabled={isPending}
                        />
                    </div>

                    {/* အီးမေးလ် */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="owner@bitecraft.com"
                            className="w-full bg-background/50 border border-border rounded-xl p-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* လျှို့ဝှက်နံပါတ် + Show/Hide */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                className="w-full bg-background/50 border border-border rounded-xl p-3.5 pr-12 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                required
                                minLength={6}
                                disabled={isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

                    {/* လျှို့ဝှက်နံပါတ် ထပ်မံရိုက်ပါ (Confirm Password) */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="••••••••"
                                className="w-full bg-background/50 border border-border rounded-xl p-3.5 pr-12 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                required
                                disabled={isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                        className="group relative w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-4 rounded-xl transition-all overflow-hidden flex items-center justify-center gap-2 mt-4 shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {!isPending && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        )}
                        {isPending ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>စနစ်ပြင်ဆင်နေသည်...</span>
                            </>
                        ) : (
                            <>
                                <span>Register Account</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-foreground font-bold hover:text-accent transition-all">
                            Sign In
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}