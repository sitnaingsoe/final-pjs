// components/dashboard/MenuCardActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { updateMenuItem, deleteMenuItem } from '@/server/actions/menu'

export default function MenuCardActions({ item, categories, addonCategories }: { item: any, categories: any[], addonCategories: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
            if (res.success) setIsOpen(false)
            else setError(res.error || "ပြင်ဆင်၍မရပါ")
        })
    }

    const handleDelete = () => {
        if (confirm(`"${item.name}" ကို အပြီးတိုင် ဖျက်မှာ သေချာပါသလား?`)) {
            startTransition(async () => {
                await deleteMenuItem(item.id)
            })
        }
    }

    return (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => setIsOpen(true)} className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition" title="ပြင်ဆင်မည်">✏️</button>
            <button onClick={handleDelete} disabled={isPending} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50" title="ဖျက်မည်">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </button>

            {/* Edit Dialog Box */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl space-y-4">
                        <div>
                            <h3 className="text-xs font-black text-orange-500 uppercase">✏️ Edit Menu Item</h3>
                            <p className="text-3xs text-slate-500 font-bold mt-0.5">ဟင်းပွဲအသေးစိတ် ပြင်ဆင်ရန်</p>
                        </div>

                        {error && <div className="text-3xs text-red-400 bg-red-950/20 p-2 rounded-lg">⚠️ {error}</div>}

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">ဟင်းပွဲအမည်</label>
                                <input type="text" name="name" defaultValue={item.name} required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">ဈေးနှုန်း (MMK)</label>
                                <input type="number" name="price" defaultValue={item.price} required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">အုပ်စု ရွေးချယ်ရန်</label>
                                <select name="categoryId" defaultValue={item.categoryId} required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">Addon Categories</label>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 max-h-20 overflow-y-auto space-y-1">
                                    {addonCategories.map(addon => (
                                        <label key={addon.id} className="flex items-center gap-2 text-xs text-slate-300">
                                            <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => handleAddonChange(addon.id)} className="accent-orange-500 rounded" />
                                            <span>{addon.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                                <button type="button" onClick={() => setIsOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-3xs font-bold">Cancel</button>
                                <button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-3xs font-bold">{isPending ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}