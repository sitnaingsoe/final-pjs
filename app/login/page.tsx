// app/login/page.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // 👈 လင့်ခ်များ ချိတ်ဆက်ရန်
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition() // 👈 ခေတ်မီ Loading State ကို သုံးပါသည်

  const handleLoginSubmit = (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      setError("အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ်ကို ဖြည့်စွက်ပေးပါ")
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError("အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်")
        } else {
          router.push('/orders')
          router.refresh()
        }
      } catch (err) {
        setError("ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ")
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-3xl">🍕</div>
          <h1 className="text-2xl font-black text-white tracking-wide">Backoffice Login</h1>
          <p className="text-xs text-slate-400">စနစ်အတွင်းသို့ ဝင်ရောက်ရန် အကောင့်အချက်အလက် ဖြည့်ပါ</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2 animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form action={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">အီးမေးလ် (Email)</label>
            <input
              type="email"
              name="email"
              placeholder="admin@restaurant.com"
              className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition bg-slate-900 text-white placeholder-slate-500"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-400">လျှို့ဝှက်နံပါတ် (Password)</label>

              {/* 🔗 Forgot Password Link */}
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-orange-500 hover:text-orange-400 hover:underline transition"
              >
                စကားဝှက်မေ့နေပါသလား?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
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
                <span>စစ်ဆေးနေပါသည်...</span>
              </>
            ) : (
              "🔑 စနစ်ထဲသို့ ဝင်မည်"
            )}
          </button>
        </form>

        {/* Register Path Link */}
        <div className="text-center pt-2 border-t border-slate-900">
          <Link href="/register" className="text-xs text-slate-400 hover:text-white transition">
            အကောင့်မရှိသေးဘူးလား? <span className="text-orange-500 font-bold hover:underline">Register ဖွင့်ရန်</span>
          </Link>
        </div>

      </div>
    </div>
  )
}