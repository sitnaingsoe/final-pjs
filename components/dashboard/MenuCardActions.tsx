// components/dashboard/MenuCardActions.tsx
'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateMenuItem, deleteMenuItem } from '@/server/actions/menu'

export default function MenuCardActions({ item, categories, addonCategories, discounts = [] }: { item: any, categories: any[], addonCategories: any[], discounts?: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // လက်ရှိ မီနူးတွင် ရှိနှင့်ပြီးသား Addon IDs များ ယူဆခြင်း
    const initialAddons = item.addonCategories?.map((a: any) => a.id) || []
    const [selectedAddons, setSelectedAddons] = useState<string[]>(initialAddons)

    const handleAddonChange = (id: string) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
    }

    const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl || null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
        } else {
            setImagePreview(item.imageUrl || null)
        }
    }

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            setError(null)
            const res = await updateMenuItem(item.id, formData, selectedAddons)
            if (res.success) {
                setIsEditOpen(false)
            } else {
                setError(res.error || "အမှားအယွင်းရှိနေပါသည်")
            }
        })
    }

    const handleDeleteConfirm = () => {
        startTransition(async () => {
            const res = await deleteMenuItem(item.id)
            if (res && !res.success) {
                alert(res.error)
            }
            setIsDeleteOpen(false)
        })
    }

    const modalsContent = (
        <>
            {isEditOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsEditOpen(false)}></div>
                    
                    <div className="bg-card/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 flex flex-col text-left border border-border/50 custom-scrollbar">
                        <div className="sticky top-0 z-20 bg-card/80 border-b border-border/50 p-6 sm:p-8 flex justify-between items-start backdrop-blur-xl">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Edit Menu Item</h3>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">ဟင်းပွဲအသေးစိတ်ကို ပြင်ဆင်ရန်</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 bg-card/40">
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">ဟင်းပွဲ/မုန့် အမည် <span className="text-foreground">*</span></label>
                                        <input type="text" name="name" defaultValue={item.name} required disabled={isPending} className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm focus:shadow-md" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">ဈေးနှုန်း (MMK) <span className="text-foreground">*</span></label>
                                        <input type="number" name="price" defaultValue={item.price} required disabled={isPending} className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm focus:shadow-md font-mono" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">အုပ်စု ရွေးချယ်ရန် <span className="text-foreground">*</span></label>
                                        <div className="relative">
                                            <select name="categoryId" defaultValue={item.categoryId} required disabled={isPending} className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary appearance-none transition-all shadow-sm focus:shadow-md">
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">လျှော့စျေး (Discount)</label>
                                        <div className="relative">
                                            <select name="discountId" defaultValue={item.discountId || ""} disabled={isPending} className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary appearance-none transition-all shadow-sm focus:shadow-md">
                                                <option value="">-- လျှော့စျေး မရှိပါ --</option>
                                                {discounts.map(disc => (
                                                    <option key={disc.id} value={disc.id}>
                                                        {disc.name} ({disc.type === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value} MMK`} OFF)
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">ဓာတ်ပုံ (ချန်လှပ်ထားနိုင်သည်)</label>
                                    <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-2 shadow-sm">
                                        {imagePreview && (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 shrink-0 shadow-inner">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input type="file" name="image" accept="image/*" onChange={handleImageChange} disabled={isPending} className="w-full text-xs font-bold text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-black file:bg-black file:text-white hover:file:bg-gray-900 transition-colors cursor-pointer" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">တွဲဖက်စားစရာ (Addon Categories)</label>
                                    <div className="bg-card border border-border rounded-xl p-3 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 shadow-inner custom-scrollbar">
                                        {addonCategories.map(addon => (
                                            <label key={addon.id} className="flex items-center gap-3 text-xs text-foreground cursor-pointer select-none hover:text-foreground transition-colors bg-muted/50 p-3 rounded-xl border border-border/50 hover:border-orange-500/20 hover:bg-card shadow-sm">
                                                <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => handleAddonChange(addon.id)} className="accent-black rounded border-border bg-card w-4 h-4 cursor-pointer" disabled={isPending} />
                                                <span className="truncate font-bold text-[10px] uppercase tracking-widest">{addon.name}</span>
                                            </label>
                                        ))}
                                        {addonCategories.length === 0 && (
                                            <div className="col-span-1 sm:col-span-2 text-[10px] text-muted-foreground font-bold p-2 text-center py-4 uppercase tracking-widest">အပိုပစ္စည်းများ မရှိသေးပါ</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">ပါဝင်ပစ္စည်း / ဖော်ပြချက်</label>
                                    <textarea name="description" defaultValue={item.description || ""} disabled={isPending} className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground placeholder-slate-400 focus:outline-none focus:border-primary h-24 resize-none transition-all shadow-sm focus:shadow-md" placeholder="Enter description..."></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                    <button type="button" onClick={() => setIsEditOpen(false)} disabled={isPending} className="bg-card hover:bg-muted/50 border border-border text-muted-foreground hover:text-foreground font-bold px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors shadow-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isPending} className="group relative bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2">
                                        {isPending ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Save Changes</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsDeleteOpen(false)}></div>
                    <div className="bg-card/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center border border-border/50">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Delete Menu Item?</h3>
                        <p className="text-xs font-bold text-muted-foreground mb-8 leading-relaxed">
                            Are you sure you want to delete <strong className="text-foreground">{item.name}</strong>? This action cannot be undone.
                        </p>
                        
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isPending} className="flex-1 bg-card border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground font-black py-3.5 rounded-xl transition-colors text-[10px] uppercase tracking-widest shadow-sm">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteConfirm} disabled={isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:hover:translate-y-0">
                                {isPending ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )

    return (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-card/80 backdrop-blur-md rounded-xl p-1 shadow-sm border border-border/50">
            <button onClick={() => setIsEditOpen(true)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg transition-colors" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
            </button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button onClick={() => setIsDeleteOpen(true)} disabled={isPending} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>

            {mounted && createPortal(modalsContent, document.body)}
        </div>
    )
}