// components/dashboard/CreateMenuDialog.tsx
'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createMasterMenu } from '@/server/actions/centralMenu'
import InputField from '../ui/InputField'

export default function CreateMenuDialog({ branches }: { branches: any[] }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedBranches, setSelectedBranches] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const handleCheckboxChange = (branchId: string) => {
        setSelectedBranches(prev =>
            prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]
        )
    }

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await createMasterMenu(formData, selectedBranches)
            if (res.success) {
                setIsOpen(false)
                setSelectedBranches([])
                router.refresh()
            } else {
                setError(res.error || 'သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်')
            }
        })
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="group relative inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-bold px-6 py-3.5 rounded-[1rem] text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <span>Create Main Menu</span>
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-card/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border/50 animate-in zoom-in-95 duration-300">
                        <div className="sticky top-0 z-20 bg-card/80 border-b border-border/50 p-8 flex justify-between items-start backdrop-blur-xl">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Add Main Product</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">ဟင်းပွဲအသစ်သတ်မှတ်၍ ဆိုင်ခွဲများသို့ တန်းဖြန့်ခြင်း</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-card/40">
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-6">
                                <InputField label="Menu Name (ဟင်းပွဲအမည်)" name="name" placeholder="ဥပမာ - ကြက်သားတုတ်ထိုး" required disabled={isPending} />
                                <InputField label="Base Price (စံနှုန်းစျေးနှုန်း)" type="number" name="basePrice" placeholder="0.00" required disabled={isPending} />

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Menu Image (ပုံ)</label>
                                    <input type="file" name="image" accept="image/*" disabled={isPending} className="w-full bg-card border border-border rounded-xl p-2 text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-900 transition-colors cursor-pointer" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description (အညွှန်း)</label>
                                    <textarea name="description" disabled={isPending} className="w-full h-20 bg-card border border-border rounded-xl p-4 text-xs focus:outline-none focus:border-primary text-foreground placeholder-slate-400 resize-none transition-colors" placeholder="ဟင်းပွဲအကြောင်း အနည်းငယ်ဖော်ပြပါ..."></textarea>
                                </div>

                                {/* 🎯 ဆိုင်ခွဲများ ရွေးချယ်ရန် Checkbox စာရင်း */}
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Branches to Deploy (ဖြန့်ဝေမည့် ဆိုင်ခွဲများ)</label>
                                    <div className="bg-card border border-border rounded-xl p-3 max-h-32 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 custom-scrollbar">
                                        {branches.map(branch => (
                                            <label key={branch.id} className="flex items-center gap-3 text-xs text-foreground cursor-pointer select-none hover:text-foreground transition-colors bg-muted/50/50 p-3 rounded-xl border border-border/50 hover:border-border">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBranches.includes(branch.id)}
                                                    onChange={() => handleCheckboxChange(branch.id)}
                                                    className="accent-black w-4 h-4 rounded border-gray-300 bg-card cursor-pointer"
                                                    disabled={isPending}
                                                />
                                                <span className="font-bold truncate">{branch.name}</span>
                                            </label>
                                        ))}
                                        {branches.length === 0 && (
                                            <div className="col-span-1 sm:grid-cols-2 text-xs text-muted-foreground font-bold p-2 text-center py-4 bg-muted/50 rounded-xl border border-dashed border-border uppercase tracking-widest">ဆိုင်ခွဲများ မရှိသေးပါ</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                    <button type="button" onClick={() => setIsOpen(false)} className="bg-card hover:bg-muted/50 border border-border text-muted-foreground hover:text-foreground font-bold px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors shadow-sm">Cancel</button>
                                    <button type="submit" disabled={isPending} className="group relative bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2">
                                        {isPending ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Deploying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Save & Deploy</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            , document.body)}
        </>
    )
}