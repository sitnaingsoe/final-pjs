// components/dashboard/CreateMenuForm.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { createMenuItem } from '@/server/actions/menu'

export default function CreateMenuForm({ categories, addonCategories, discounts = [] }: { categories: any[], addonCategories: any[], discounts?: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedAddons, setSelectedAddons] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const handleAddonChange = (id: string) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
        } else {
            setImagePreview(null)
        }
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
                setImagePreview(null)
                setIsOpen(false) // Close modal on success
            } else {
                setError(res.error || "အမှားအယွင်းရှိနေပါသည်")
            }
        })
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
            >
                <span>➕</span> ဟင်းပွဲအသစ် ထည့်မည်
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 p-2 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                        
                        <h3 className="font-black text-slate-200 mb-6 flex items-center gap-2 text-lg uppercase tracking-wider">
                            <span className="text-orange-500">➕</span> ဟင်းပွဲအသစ် ထည့်မည်
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="text-xs text-red-400 bg-red-950/20 p-3 rounded-lg border border-red-900/50">⚠️ {error}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">ဟင်းပွဲ/မုန့် အမည် *</label>
                                    <input type="text" name="name" required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors" placeholder="ဥပမာ - ကြက်သားတုတ်ထိုး" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">ဈေးနှုန်း (MMK) *</label>
                                    <input type="number" name="price" required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors" placeholder="ဥပမာ - ၃၅၀၀" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">အုပ်စု ရွေးချယ်ရန် *</label>
                                <select name="categoryId" required disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none transition-colors">
                                    <option value="">-- အမျိုးအစား ရွေးပါ --</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">လျှော့စျေး (Discount)</label>
                                <select name="discountId" disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none transition-colors">
                                    <option value="">-- လျှော့စျေး မရှိပါ --</option>
                                    {discounts.map(disc => (
                                        <option key={disc.id} value={disc.id}>
                                            {disc.name} ({disc.type === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value} MMK`} OFF)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">ဟင်းပွဲ ဓာတ်ပုံ (Image)</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && (
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        name="image" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={isPending} 
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">တွဲဖက်စားစရာ (Addon Categories)</label>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-32 overflow-y-auto grid grid-cols-2 gap-2">
                                    {addonCategories.map(addon => (
                                        <label key={addon.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none hover:text-white transition-colors bg-slate-950 p-2 rounded-lg border border-slate-800/50">
                                            <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => handleAddonChange(addon.id)} className="accent-orange-500 rounded border-slate-800 bg-slate-950 w-4 h-4" disabled={isPending} />
                                            <span className="truncate">{addon.name}</span>
                                        </label>
                                    ))}
                                    {addonCategories.length === 0 && (
                                        <div className="col-span-2 text-xs text-slate-500 italic p-2">အပိုပစ္စည်းများ မရှိသေးပါ</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">ပါဝင်ပစ္စည်း / ဖော်ပြချက်</label>
                                <textarea name="description" disabled={isPending} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 h-24 resize-none transition-colors" placeholder="ဥပမာ - ကြက်သားသန့်သန့်..." />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsOpen(false)} disabled={isPending} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl transition-colors">
                                    ပယ်ဖျက်မည်
                                </button>
                                <button type="submit" disabled={isPending} className="w-2/3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25 flex justify-center items-center gap-2">
                                    {isPending ? <span className="animate-pulse">သိမ်းဆည်းနေပါသည်...</span> : "🚀 မီနူးထဲသို့ ထည့်မည်"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}