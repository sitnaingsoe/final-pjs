// app/page.tsx
import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-white font-sans selection:bg-orange-500 selection:text-white">

      {/* 🌐 Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-6 py-4 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍕</span>
          <span className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            BiteCraft OS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl transition shadow-md shadow-orange-500/20"
          >
            Register
          </Link>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto space-y-8 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-orange-400 font-medium">
          ✨ Next.js 15 & Auth.js v5 Powered
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none">
          Modern Restaurant <br />
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
            Backoffice Management
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          အော်ဒါများ စီမံခန့်ခွဲခြင်း၊ Menu စာရင်းများ ထိန်းချုပ်ခြင်း၊ စားပွဲဝိုင်းများနှင့် အရောင်းစာရင်းများကို ဗဟိုချက်တစ်ခုတည်းကနေ လုံခြုံစိတ်ချစွာ စီမံခန့်ခွဲနိုင်မည့် နည်းပညာမြင့် Backoffice စနစ်။
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none pt-4">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-8 transition shadow-lg shadow-orange-500/10"
          >
            🔑 စနစ်ထဲသို့ ဝင်ရောက်ရန်
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold px-8 border border-slate-700 transition"
          >
            🎯 အကောင့်အသစ်ဖွင့်ရန်
          </Link>
        </div>
      </main>

      {/* 📊 Quick Feature Grid */}
      <section className="bg-slate-950/40 border-t border-slate-800/60 py-12 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-xl">📦</div>
            <h3 className="font-bold text-sm text-slate-200">Real-time Orders</h3>
            <p className="text-xs text-slate-400">မီးဖိုချောင်နှင့် ဝန်ထမ်းများအကြား အော်ဒါများကို ချက်ချင်းစီမံနိုင်ခြင်း။</p>
          </div>
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-xl">🍔</div>
            <h3 className="font-bold text-sm text-slate-200">Menu & Categories</h3>
            <p className="text-xs text-slate-400">ဟင်းပွဲအမျိုးအစားများနှင့် ဈေးနှုန်းများကို စက္ကန့်ပိုင်းအတွင်း ပြောင်းလဲခြင်း။</p>
          </div>
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-xl">🔒</div>
            <h3 className="font-bold text-sm text-slate-200">Role-Based Security</h3>
            <p className="text-xs text-slate-400">NextAuth & Middleware ဖြင့် ဒေတာများကို စိတ်ချရစွာ ကာကွယ်ထားခြင်း။</p>
          </div>
        </div>
      </section>

      {/* 📝 Footer */}
      <footer className="border-t border-slate-800/40 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} BiteCraft OS. All rights reserved. Built for Restaurant Excellence.
      </footer>

    </div>
  )
}