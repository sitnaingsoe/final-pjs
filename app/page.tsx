"use client"

import React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export default function Home() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground relative">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Navigation Bar */}
      <header 
        className="animate-in slide-in-from-top-10 duration-700 fade-in fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 glass rounded-2xl px-6 py-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="text-xl font-bold tracking-tight">
            BiteCraft OS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {/* Simple dot to toggle theme for MVP */}
            <span className="block w-4 h-4 rounded-full border-2 border-current" />
          </button>
          <Link
            href="/login"
            className="text-sm font-medium hover:text-accent transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-foreground text-background hover:scale-105 font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-black/10 flex items-center gap-2"
          >
            Get Started <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto pt-32 pb-20 relative z-10">
        <div 
          className="animate-in fade-in zoom-in-95 duration-700 delay-200 fill-mode-both inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border text-xs font-semibold tracking-wide mb-8 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Next.js 15 & Auth.js v5 Powered
        </div>

        <h1 
          className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300 fill-mode-both text-6xl sm:text-8xl font-black tracking-tighter leading-[1.1] mb-6"
        >
          Restaurant <br />
          <span className="text-gradient">Intelligence</span>
        </h1>

        <p 
          className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-500 fill-mode-both max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-10"
        >
          အော်ဒါများ စီမံခန့်ခွဲခြင်း၊ Menu စာရင်းများ ထိန်းချုပ်ခြင်း၊ စားပွဲဝိုင်းများနှင့် အရောင်းစာရင်းများကို ဗဟိုချက်တစ်ခုတည်းကနေ လုံခြုံစိတ်ချစွာ စီမံခန့်ခွဲနိုင်မည့် နည်းပညာမြင့် Backoffice စနစ်။
        </p>

        {/* Action Buttons */}
        <div 
          className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-700 fill-mode-both flex flex-col sm:flex-row gap-4 justify-center w-full"
        >
          <Link
            href="/login"
            className="flex h-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-base font-semibold px-8 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 gap-2"
          >
            စနစ်ထဲသို့ ဝင်ရောက်ရန် <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
          <Link
            href="/register"
            className="flex h-14 items-center justify-center rounded-xl glass hover:bg-muted text-foreground text-base font-semibold px-8 border border-border transition-all hover:scale-105 shadow-sm"
          >
            အကောင့်အသစ်ဖွင့်ရန်
          </Link>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="relative z-10 py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            delay={0.6}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>}
            title="Real-time Orders"
            desc="မီးဖိုချောင်နှင့် ဝန်ထမ်းများအကြား အော်ဒါများကို ချက်ချင်းစီမံနိုင်ခြင်း။"
          />
          <FeatureCard 
            delay={0.7}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>}
            title="Dynamic Menus"
            desc="ဟင်းပွဲအမျိုးအစားများနှင့် ဈေးနှုန်းများကို စက္ကန့်ပိုင်းအတွင်း ပြောင်းလဲခြင်း။"
          />
          <FeatureCard 
            delay={0.8}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m9 12 2 2 4-4"/><path d="M5 18v-6a9 9 0 0 1 18 0v6"/><path d="M12 22v-4"/><path d="M22 22H2"/></svg>}
            title="Bank-Grade Security"
            desc="NextAuth & Middleware ဖြင့် ဒေတာများကို စိတ်ချရစွာ ကာကွယ်ထားခြင်း။"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 glass px-6 py-10 mt-auto text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} BiteCraft OS. Built for Restaurant Excellence.
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <div 
      className="animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both p-8 glass rounded-2xl border border-border/50 shadow-lg shadow-black/5 flex flex-col gap-4 group hover:-translate-y-1 hover:scale-[1.02] transition-all"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center border border-border/50 group-hover:border-accent/50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  )
}