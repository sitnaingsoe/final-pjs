// components/dashboard/MenuRowActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateMasterMenu, toggleMenuStatus } from '@/server/actions/centralMenu'
import InputField from '../ui/InputField'

export default function MenuRowActions({ menu, branches = [] }: { menu: any, branches?: any[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isToggleOpen, setIsToggleOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedBranches, setSelectedBranches] = useState<string[]>(
        menu.branches ? menu.branches.map((b: any) => b.branchId) : []
    )

    const handleCheckboxChange = (branchId: string) => {
        setSelectedBranches(prev =>
            prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]
        )
    }

    const handleUpdateMenu = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await updateMasterMenu(menu.id, formData, selectedBranches)
            if (res.success) {
                setIsEditOpen(false)
                router.refresh()
            } else {
                setError(res.error || 'သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်')
            }
        })
    }

    const handleToggleStatusConfirm = () => {
        startTransition(async () => {
            await toggleMenuStatus(menu.id, menu.isActive)
            setIsToggleOpen(false)
            router.refresh()
        })
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {/* ✏️ Edit Button */}
            <button
                onClick={() => setIsEditOpen(true)}
                className="group relative flex items-center justify-center w-8 h-8 bg-muted/50 hover:bg-black border border-border hover:border-primary text-muted-foreground hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
                title="Edit Menu"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
            </button>

            {/* 👁️ Toggle Status Button */}
            <button
                onClick={() => setIsToggleOpen(true)}
                disabled={isPending}
                className={`group relative flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden border disabled:opacity-50 ${menu.isActive
                    ? 'bg-muted/50 hover:bg-amber-500 border-border hover:border-amber-500 text-amber-500 hover:text-white'
                    : 'bg-muted/50 hover:bg-green-600 border-border hover:border-green-600 text-green-500 hover:text-white'
                    }`}
                title={menu.isActive ? "Archive Menu" : "Activate Menu"}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {menu.isActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                )}
            </button>

            {/* Edit Menu Dialog Box Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsEditOpen(false)}></div>
                    <div className="bg-card/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-md relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-card/80 border-b border-border/50 p-6 flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">Edit Main Menu</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-widest">ဟင်းပွဲအမည်နှင့် စံနှုန်းစျေးနှုန်း ပြင်ဆင်ခြင်း</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-card/40">
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span className="font-bold">{error}</span>
                                </div>
                            )}

                            <form action={handleUpdateMenu} className="space-y-5">
                                <InputField label="Menu Name" name="name" defaultValue={menu.name} required disabled={isPending} />
                                <InputField label="Base Price (MMK)" type="number" name="basePrice" defaultValue={menu.basePrice} required disabled={isPending} />

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Menu Image (ပုံ အသစ်ပြောင်းရန်)</label>
                                    <input type="file" name="image" accept="image/*" disabled={isPending} className="w-full bg-card border border-border rounded-xl p-2 text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-900 transition-colors cursor-pointer" />
                                    {menu.image && (
                                        <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">ယခုလက်ရှိပုံ: <a href={menu.image} target="_blank" className="text-foreground underline font-black hover:text-foreground ml-1">ကြည့်ရန်</a></p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</label>
                                    <textarea name="description" defaultValue={menu.description || ''} disabled={isPending} className="w-full h-20 bg-card border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-primary text-foreground placeholder-slate-400 resize-none transition-colors"></textarea>
                                </div>

                                {/* 🎯 ဆိုင်ခွဲများ ရွေးချယ်ရန် Checkbox စာရင်း */}
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Branches (ဖြန့်ဝေမည့် ဆိုင်ခွဲများ)</label>
                                    <div className="bg-card border border-border rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
                                        {branches.map(branch => (
                                            <label key={branch.id} className="flex items-center gap-3 text-xs text-foreground cursor-pointer select-none hover:text-foreground transition-colors bg-muted/50/50 p-2.5 rounded-lg border border-border/50 hover:border-border">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBranches.includes(branch.id)}
                                                    onChange={() => handleCheckboxChange(branch.id)}
                                                    className="accent-black rounded border-gray-300 bg-card w-4 h-4 cursor-pointer"
                                                    disabled={isPending}
                                                />
                                                <span className="font-bold">{branch.name}</span>
                                            </label>
                                        ))}
                                        {branches.length === 0 && (
                                            <div className="text-xs text-muted-foreground font-bold p-2 text-center py-4 bg-muted/50 rounded-lg border border-dashed border-border uppercase tracking-widest">ဆိုင်ခွဲများ မရှိသေးပါ</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                    <button type="button" onClick={() => setIsEditOpen(false)} disabled={isPending} className="bg-card border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-colors shadow-sm">Cancel</button>
                                    <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5">
                                        {isPending ? (
                                            <>
                                                <svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Saving...</span>
                                            </>
                                        ) : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Toggle Status Dialog Box Modal */}
            {isToggleOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsToggleOpen(false)}></div>
                    <div className="bg-card/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${menu.isActive ? 'bg-amber-500 shadow-amber-500/20 rotate-3' : 'bg-green-500 shadow-green-500/20 -rotate-3'}`}>
                            {menu.isActive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">{menu.isActive ? "Archive Menu?" : "Activate Menu?"}</h3>
                        <p className="text-xs text-muted-foreground mb-8 font-bold">
                            {menu.isActive 
                                ? <>Are you sure you want to archive <strong className="text-foreground uppercase">{menu.name}</strong>? Sales history will not be deleted.</>
                                : <>Are you sure you want to activate <strong className="text-foreground uppercase">{menu.name}</strong> to be available in the system?</>
                            }
                        </p>
                        
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsToggleOpen(false)} disabled={isPending} className="flex-1 bg-card border border-border hover:bg-muted/50 text-gray-800 font-bold py-3 rounded-xl transition-colors text-xs uppercase tracking-wider shadow-sm">
                                Cancel
                            </button>
                            <button type="button" onClick={handleToggleStatusConfirm} disabled={isPending} className={`flex-1 font-black py-3 rounded-xl transition-all text-xs uppercase tracking-wider disabled:opacity-50 text-white shadow-lg hover:-translate-y-0.5 ${menu.isActive ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'}`}>
                                {isPending ? "Processing..." : (menu.isActive ? "Yes, Archive" : "Yes, Activate")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}