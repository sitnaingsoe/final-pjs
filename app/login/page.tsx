// app/login/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react' // 👈 NextAuth signIn ကို import ခေါ်ပါ

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError(null);
    setLoading(true);

    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (!email || !password) {
      setError("အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ်ကို ဖြည့်စွက်ပေးပါ");
      setLoading(false);
      return;
    }

    try {
      // 🚀 NextAuth ရဲ့ credentials စနစ်ဖြင့် Token ဆောက်ခိုင်းခြင်း
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // အောင်မြင်မှ ကိုယ့်စိတ်ကြိုက် လမ်းကြောင်းပြောင်းရန်
      });

      if (result?.error) {
        setError("အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်");
        setLoading(false);
      } else {
        // Token ရှိသွားပြီဖြစ်၍ Middleware က အဝင်ခံမည် ဖြစ်သောကြောင့် /orders ဆီ တိုက်ရိုက်လွှတ်ခြင်း
        router.push('/orders');
        router.refresh();
      }

    } catch (err) {
      setError("ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-800 w-full max-w-md space-y-6">

        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-white">Backoffice Login</h1>
          <p className="text-xs text-slate-400">စနစ်အတွင်းသို့ ဝင်ရောက်ရန် အကောင့်အချက်အလက် ဖြည့်ပါ</p>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">အီးမေးလ် (Email)</label>
            <input
              type="email"
              id="email"
              placeholder="admin@restaurant.com"
              className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-500 transition bg-slate-900 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">လျှို့ဝှက်နံပါတ် (Password)</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-500 transition bg-slate-900 text-white placeholder-slate-500"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold py-3.5 rounded-xl transition shadow-sm disabled:bg-slate-800 disabled:text-slate-500 font-medium"
          >
            {loading ? "စစ်ဆေးနေပါသည်..." : "🔑 စနစ်ထဲသို့ ဝင်မည်"}
          </button>
        </div>

      </div>
    </div>
  )
}