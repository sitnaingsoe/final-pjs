// components/dashboard/MenuCardActions.tsx
'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateMenuItem, deleteMenuItem } from '@/server/actions/menu'

export default function MenuCardActions({ item, categories, addonCategories, discounts = [] }: { item: any, categories: any[], addonCategories: any[], discounts?: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // လက်ရှိ မီနူးတွင် ရှိနှင့်ပြီးသား Addon IDs များ ယူဆခြင်း
    const initialAddons = item.addonCategories?.map((a: any) => a.addonCategoryId) || []
    const [selectedAddons, setSelectedAddons] = useState<string[]>(initialAddons)

    const handleAddonChange = (id: string) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
    }

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            setError(null)
            const res = await updateMenuItem(item.id, formData, selectedAddons)
            if (res.success) {
                setIsOpen(false)
            } else {
                setError(res.error || "အမှားအယွင်းရှိနေပါသည်")
            }
        })
    }

    const handleDelete = () => {
        if (confirm(`"${item.name}" ကို အပြီးတိုင် ဖျက်မှာ သေချာပါသလား?`)) {
            startTransition(async () => {
                await deleteMenuItem(item.id)
            })
        }
    }

    const modalContent = isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
                {/* Close button */}
                <button 
                    onClick={() => !isPending && setIsOpen(false)}
                    disabled={isPending}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    ✕
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-black text-orange-500 flex items-center gap-2">
                        <span>✏️</span> ပြင်ဆင်မည်
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">ဟင်းပွဲအသေးစိတ်ကို ပြင်ဆင်ပါ</p>
                </div>

                {error && <div className="text-xs text-red-400 bg-red-950/20 p-3 rounded-lg mb-4">⚠️ {error}</div>}

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300">ဟင်းပွဲအမည်</label>
                        <input type="text" name="name" defaultValue={item.name} required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300">ဓာတ်ပုံ (ချန်လှပ်ထားနိုင်သည်)</label>
                        <input type="file" name="image" accept="image/*" disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500/20" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300">ဈေးနှုန်း (MMK)</label>
                            <input type="number" name="price" defaultValue={item.price} required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300">အုပ်စု ရွေးချယ်ရန်</label>
                            <select name="categoryId" defaultValue={item.categoryId} required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300">လျှော့စျေး (Discount)</label>
                        <select name="discountId" defaultValue={item.discountId || ""} disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                            <option value="">-- လျှော့စျေး မရှိပါ --</option>
                            {discounts.map(disc => (
                                <option key={disc.id} value={disc.id}>
                                    {disc.name} ({disc.type === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value} MMK`} OFF)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300">ပါဝင်ပစ္စည်း / ဖော်ပြချက် (Description)</label>
                        <textarea name="description" defaultValue={item.description || ""} disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors h-24 resize-none" placeholder="ဖော်ပြချက် ထည့်သွင်းရန်"></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300">Add-on Categories ထည့်သွင်းရန်</label>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-h-40 overflow-y-auto grid grid-cols-2 gap-3">
                            {addonCategories.map(addon => (
                                <label key={addon.id} className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
                                    <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => handleAddonChange(addon.id)} className="w-4 h-4 accent-orange-500 rounded" />
                                    <span className="font-medium">{addon.name}</span>
                                </label>
                            ))}
                            {addonCategories.length === 0 && <span className="text-xs text-slate-500 italic col-span-2">Add-on အမျိုးအစားများ မရှိသေးပါ။</span>}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-end">
                        <button type="submit" disabled={isPending} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center min-w-[140px]">
                            {isPending ? "သိမ်းဆည်းနေပါသည်..." : "သိမ်းမည် (Save)"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null

    return (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => setIsOpen(true)} className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition" title="ပြင်ဆင်မည်">✏️</button>
            <button onClick={handleDelete} disabled={isPending} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50" title="ဖျက်မည်">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    )
}