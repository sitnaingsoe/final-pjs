// components/dashboard/CreateMenuForm.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { createMenuItem } from '@/server/actions/menu'

export default function CreateMenuForm({ categories, addonCategories }: { categories: any[], addonCategories: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [selectedAddons, setSelectedAddons] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    const handleAddonChange = (id: string) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            setError(null)
            const res = await createMenuItem(formData, selectedAddons)
            if (res.success) {
                (e.target as HTMLFormElement).reset()
                setSelectedAddons([])
            } else {
                setError(res.error || "အမှားအယွင်းရှိနေပါသည်")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-3xs text-red-400 bg-red-950/20 p-2 rounded-lg">⚠️ {error}</div>}

            <div className="space-y-1.5">
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">ဟင်းပွဲ/မုန့် အမည် *</label>
                <input type="text" name="name" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500" placeholder="ဥပမာ - ကြက်သားတုတ်ထိုး" />
            </div>

            <div className="space-y-1.5">
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">ဈေးနှုန်း (MMK) *</label>
                <input type="number" name="price" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500" placeholder="ဥပမာ - ၃၅၀၀" />
            </div>

            <div className="space-y-1.5">
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">အုပ်စု ရွေးချယ်ရန် *</label>
                <select name="categoryId" required disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none">
                    <option value="">-- အမျိုးအစား ရွေးပါ --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>

            {/* 🎯 Addon Categories Multi-select List */}
            <div className="space-y-1.5">
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">တွဲဖက်စားစရာ ရွေးချယ်ရန် (Addon Categories)</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 max-h-24 overflow-y-auto space-y-1.5">
                    {addonCategories.map(addon => (
                        <label key={addon.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                            <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => handleAddonChange(addon.id)} className="accent-orange-500 rounded border-slate-800 bg-slate-950" disabled={isPending} />
                            <span>{addon.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">ပါဝင်ပစ္စည်း / ဖော်ပြချက်</label>
                <textarea name="description" disabled={isPending} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 h-20 resize-none" placeholder="ဥပမာ - ကြက်သားသန့်သန့်..." />
            </div>

            <button type="submit" disabled={isPending} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md">
                {isPending ? "သိမ်းဆည်းနေပါသည်..." : "🚀 မီနူးထဲသို့ ထည့်မည်"}
            </button>
        </form>
    )
}