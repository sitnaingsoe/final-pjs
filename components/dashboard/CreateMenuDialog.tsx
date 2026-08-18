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
    const [selectedBranches, setSelectedBranches] = useState<string[]>(
        branches.map(b => b.id)
    )
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const allBranchIds = branches.map(b => b.id)
    const isAllSelected = branches.length > 0 && selectedBranches.length === branches.length

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedBranches(allBranchIds)
        } else {
            setSelectedBranches([])
        }
    }

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
                setSelectedBranches(allBranchIds)
                router.refresh()
            } else {
                setError(res.error || 'သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်')
            }
        })
    }

    return (
        <>
            <button 
                onClick={() => {
                    setSelectedBranches(allBranchIds)
                    setIsOpen(true)
                }} 
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden shrink-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <span>Create Main Menu</span>
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-card rounded-[2rem] w-full max-w-lg max-h-[88vh] overflow-y-auto custom-scrollbar flex flex-col relative z-10 shadow-2xl border border-border/60 animate-in zoom-in-95 duration-300">
                        
                        {/* Header */}
                        <div className="sticky top-0 z-20 bg-card/90 border-b border-border/50 p-6 sm:p-8 flex justify-between items-start backdrop-blur-xl">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Add Master Product</h3>
                                    <p className="text-xs text-muted-foreground mt-1 font-semibold">ဟင်းပွဲအသစ်သတ်မှတ်၍ ဆိုင်ခွဲများသို့ တန်းဖြန့်ခြင်း</p>
                                </div>
                            </div>
                            <button onClick={() => !isPending && setIsOpen(false)} className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 sm:p-8 bg-card">
                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-5">
                                <InputField label="Menu Name (ဟင်းပွဲအမည်)" name="name" placeholder="ဥပမာ - ကြက်သားတုတ်ထိုး" required disabled={isPending} />
                                <InputField label="Base Price (စံနှုန်းစျေးနှုန်း MMK)" type="number" name="basePrice" placeholder="0.00" required disabled={isPending} />

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider">Menu Image (ပုံ)</label>
                                    <input 
                                        type="file" 
                                        name="image" 
                                        accept="image/*" 
                                        disabled={isPending} 
                                        className="w-full bg-card border border-border rounded-xl p-2 text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-orange-500 file:to-amber-500 file:text-white hover:file:opacity-90 transition-opacity cursor-pointer" 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider">Description (အညွှန်း)</label>
                                    <textarea 
                                        name="description" 
                                        disabled={isPending} 
                                        rows={3}
                                        className="w-full bg-card border border-border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-foreground placeholder-muted-foreground resize-none transition-colors font-medium" 
                                        placeholder="ဟင်းပွဲအကြောင်း အနည်းငယ်ဖော်ပြပါ..."
                                    />
                                </div>

                                {/* 🎯 ဆိုင်ခွဲများ ရွေးချယ်ရန် Checkbox စာရင်း */}
                                <div className="space-y-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                                            Deploy To Branches ({selectedBranches.length}/{branches.length})
                                        </label>

                                        {branches.length > 0 && (
                                            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded text-orange-600 focus:ring-orange-500"
                                                />
                                                <span>Select All</span>
                                            </label>
                                        )}
                                    </div>

                                    <div className="bg-muted/30 border border-border rounded-xl p-3 max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 custom-scrollbar">
                                        {branches.map(branch => {
                                            const isChecked = selectedBranches.includes(branch.id)

                                            return (
                                                <label 
                                                    key={branch.id} 
                                                    onClick={() => handleCheckboxChange(branch.id)}
                                                    className={`flex items-center gap-2.5 text-xs font-bold cursor-pointer select-none p-2.5 rounded-xl border transition-all ${
                                                        isChecked 
                                                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-700 dark:text-orange-300' 
                                                            : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="w-3.5 h-3.5 rounded text-orange-600 pointer-events-none"
                                                        disabled={isPending}
                                                    />
                                                    <span className="truncate">{branch.name}</span>
                                                </label>
                                            )
                                        })}
                                        {branches.length === 0 && (
                                            <div className="col-span-1 sm:col-span-2 text-xs text-muted-foreground font-bold p-3 text-center bg-card rounded-xl border border-dashed border-border uppercase tracking-widest">
                                                ဆိုင်ခွဲများ မရှိသေးပါ
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsOpen(false)} 
                                        className="bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isPending} 
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-7 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isPending ? (
                                            <span>Deploying...</span>
                                        ) : (
                                            <>
                                                <span>Save & Deploy</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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