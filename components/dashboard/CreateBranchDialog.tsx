// components/dashboard/CreateBranchDialog.tsx
'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createBranchWithAdmin } from '@/server/actions/branch'
import { useRouter } from 'next/navigation'
import InputField from '../ui/InputField'

export default function CreateBranchDialog({ companyId }: { companyId: string }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const handleSubmit = async (formData: FormData) => {
        formData.append('companyId', companyId)

        startTransition(async () => {
            setError(null)
            const res = await createBranchWithAdmin(formData)
            if (res.success) {
                setIsOpen(false)
                router.refresh()
            } else {
                setError(res.error || "အမှားတစ်ခုခု ရှိနေပါသည်")
            }
        })
    }

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-bold px-6 py-3.5 rounded-[1rem] text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 overflow-hidden shrink-0"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <span>Add New Branch</span>
            </button>

            {/* Dialog Overlay & Box via Portal */}
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsOpen(false)}></div>

                    <div className="bg-card rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-300 border border-border/50">
                        {/* Header */}
                        <div className="bg-card border-b border-border/50 p-6 sm:p-8 flex justify-between items-start shrink-0">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Create Branch Structure</h3>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">Set up a new branch and assign its manager</p>
                                </div>
                            </div>
                            <button onClick={() => !isPending && setIsOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-muted-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 sm:p-8 bg-card overflow-y-auto custom-scrollbar flex-1">
                            {/* Error Handling */}
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form action={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Left Side: Branch Info */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">1</div>
                                            <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Branch Profile</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <InputField label="Branch Name" name="branchName" placeholder="e.g. Hledan Branch" required disabled={isPending} />
                                            <InputField label="Address" name="address" placeholder="Full address" disabled={isPending} />
                                            <InputField label="Phone" name="phone" placeholder="Contact number" disabled={isPending} />
                                        </div>
                                    </div>

                                    {/* Right Side: Admin User Info */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">2</div>
                                            <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Assigned Manager</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <InputField label="Manager Name" name="adminName" placeholder="John Doe" required disabled={isPending} />
                                            <InputField label="Email Address" type="email" name="adminEmail" placeholder="john@company.com" required disabled={isPending} />
                                            <InputField label="Password" type="password" name="adminPassword" placeholder="••••••••" required disabled={isPending} />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Buttons */}
                                <div className="flex justify-end gap-3 pt-8 border-t border-border/50">
                                    <button type="button" onClick={() => setIsOpen(false)} disabled={isPending} className="bg-card hover:bg-muted/50 border border-border text-muted-foreground hover:text-foreground font-bold px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors shadow-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isPending} className="group relative bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2">
                                        {isPending ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Building...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm Create</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}