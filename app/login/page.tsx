// app/login/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 🚀 ခလုတ်နှိပ်သည့်အခါ အလုပ်လုပ်မည့် ဖန်ရှင်
  async function handleLogin() {
    setError(null);
    setLoading(true);

    // DOM ထဲကနေ id ကိုသုံးပြီး input value များကို တိုက်ရိုက်ဆွဲထုတ်ခြင်း
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;

    const email = emailInput?.value;
    const password = passwordInput?.value;

    if (!email || !password) {
      setError("အီးမေးလ်နှင့် လျှို့ဝှက်နံပါတ်ကို ဖြည့်စွက်ပေးပါ");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်");
        setLoading(false);
        return;
      }

      // အကောင့်ဝင်ခြင်း အောင်မြင်ပါက dashboard သို့ လမ်းကြောင်းပြောင်းမည်
      router.push('/menu');

    } catch (err) {
      console.error("Login Error:", err);
      setError("ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ၊ ခေတ္တစောင့်ပြီး ထပ်မံကြိုးစားပါ");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-800 w-full max-w-md space-y-6">

        {/* Header အပိုင်း */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-white">Backoffice Login</h1>
          <p className="text-xs text-slate-400">စနစ်အတွင်းသို့ ဝင်ရောက်ရန် အကောင့်အချက်အလက် ဖြည့်ပါ</p>
        </div>

        {/* Error Message ပြသရန် */}
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* 🔄 <form> အစား ရိုးရိုး <div> ကို ပြောင်းလဲအသုံးပြုထားပါသည် */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">အီးမေးလ် (Email)</label>
            <input
              type="email"
              id="email" // 👈 JS ကနေ လှမ်းဖတ်နိုင်ရန် id သတ်မှတ်ပေးရပါမည်
              placeholder="admin@restaurant.com"
              className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-500 transition bg-slate-900 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">လျှို့ဝှက်နံပါတ် (Password)</label>
            <input
              type="password"
              id="password" // 👈 JS ကနေ လှမ်းဖတ်နိုင်ရန် id သတ်မှတ်ပေးရပါမည်
              placeholder="••••••••"
              className="w-full border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-500 transition bg-slate-900 text-white placeholder-slate-500"
              required
            />
          </div>

          {/* 🔄 type="button" ပြောင်းထားပြီး onClick ဖြင့် handleLogin ကို တိုက်ရိုက်ချိတ်ဆက်ထားပါသည် */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold py-3.5 rounded-xl transition shadow-sm disabled:bg-slate-800 disabled:text-slate-500 font-medium"
          >
            {loading ? "စစ်ဆေးနေပါသည်..." : "🔑 စနစ်ထဲသို့ ဝင်မည်"}
          </button>
        </div>

        {/* Register Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            အကောင့်မရှိသေးဘူးလား?{' '}
            <a href="/auth/register" className="text-white font-bold hover:underline">
              အကောင့်အသစ်ဆောက်ရန်
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}