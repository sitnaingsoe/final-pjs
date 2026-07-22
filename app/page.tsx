import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-black font-sans selection:bg-black selection:text-white">

      {/* 🌐 Top Navigation Bar */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur px-6 py-4 sm:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            BiteCraft OS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-black hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Register
          </Link>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto space-y-8 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-600 font-medium tracking-wide">
          Next.js 15 & Auth.js v5 Powered
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-tight">
          Modern Restaurant <br />
          <span className="text-gray-400">Management</span>
        </h1>

        <p className="max-w-xl mx-auto text-base sm:text-lg text-gray-500 leading-relaxed font-light">
          အော်ဒါများ စီမံခန့်ခွဲခြင်း၊ Menu စာရင်းများ ထိန်းချုပ်ခြင်း၊ စားပွဲဝိုင်းများနှင့် အရောင်းစာရင်းများကို ဗဟိုချက်တစ်ခုတည်းကနေ လုံခြုံစိတ်ချစွာ စီမံခန့်ခွဲနိုင်မည့် နည်းပညာမြင့် Backoffice စနစ်။
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full pt-4">
          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-lg bg-black hover:bg-gray-800 text-white text-sm font-medium px-8 transition-colors shadow-sm"
          >
            စနစ်ထဲသို့ ဝင်ရောက်ရန်
          </Link>
          <Link
            href="/register"
            className="flex h-11 items-center justify-center rounded-lg bg-white hover:bg-gray-50 text-black text-sm font-medium px-8 border border-gray-200 transition-colors shadow-sm"
          >
            အကောင့်အသစ်ဖွင့်ရန်
          </Link>
        </div>
      </main>

      {/* 📊 Quick Feature Grid */}
      <section className="bg-gray-50 py-16 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="p-6 bg-white border border-gray-100 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Real-time Orders</h3>
            <p className="text-sm text-gray-500 leading-relaxed">မီးဖိုချောင်နှင့် ဝန်ထမ်းများအကြား အော်ဒါများကို ချက်ချင်းစီမံနိုင်ခြင်း။</p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Menu & Categories</h3>
            <p className="text-sm text-gray-500 leading-relaxed">ဟင်းပွဲအမျိုးအစားများနှင့် ဈေးနှုန်းများကို စက္ကန့်ပိုင်းအတွင်း ပြောင်းလဲခြင်း။</p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Role-Based Security</h3>
            <p className="text-sm text-gray-500 leading-relaxed">NextAuth & Middleware ဖြင့် ဒေတာများကို စိတ်ချရစွာ ကာကွယ်ထားခြင်း။</p>
          </div>
        </div>
      </section>

      {/* 📝 Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} BiteCraft OS. All rights reserved. Built for Restaurant Excellence.
      </footer>

    </div>
  )
}