// components/dashboard/BranchRowActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBranch, deleteBranch } from '@/server/actions/branch'
import InputField from '../ui/InputField'

export default function BranchRowActions({ branch }: { branch: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Edit Submit Handle
    const handleUpdate = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await updateBranch(branch.id, formData)
            if (res.success) {
                setIsEditOpen(false)
                router.refresh()
            } else {
                setError('အမှားအယွင်းရှိနေပါသည်')
            }
        })
    }

    // Delete Confirm Handle
    const handleDeleteConfirm = () => {
        startTransition(async () => {
            const res = await deleteBranch(branch.id)
            if (res.success) {
                setIsDeleteOpen(false)
                router.refresh()
            } else {
                alert("ဖျက်ဆီးရခြင်း မအောင်မြင်ပါ")
                setIsDeleteOpen(false)
            }
        })
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {/* 📝 Edit Button */}
            <button
                onClick={() => setIsEditOpen(true)}
                className="group relative flex items-center justify-center w-8 h-8 bg-muted/50 hover:bg-black border border-border hover:border-primary text-muted-foreground hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
                title="Edit Branch"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
            </button>

            {/* 🗑️ Delete Button */}
            <button
                onClick={() => setIsDeleteOpen(true)}
                disabled={isPending}
                className="group relative flex items-center justify-center w-8 h-8 bg-muted/50 hover:bg-red-600 border border-border hover:border-red-600 text-red-500 hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden disabled:opacity-50"
                title="Delete Branch"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>

            {/* 🛠️ Edit Dialog Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsEditOpen(false)}></div>
                    <div className="bg-card/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-card/80 border-b border-border/50 p-6 flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">Edit Branch Profile</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-widest">ဆိုင်ခွဲအချက်အလက်များ ပြင်ဆင်ရန်</p>
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

                            <form action={handleUpdate} className="space-y-5">
                                <div className="space-y-4">
                                    <InputField label="Branch Name" name="branchName" defaultValue={branch.name} required disabled={isPending} />
                                    <InputField label="Address" name="address" defaultValue={branch.address || ''} disabled={isPending} />
                                    <InputField label="Phone" name="phone" defaultValue={branch.phone || ''} disabled={isPending} />
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

            {/* Custom Delete Dialog Box Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsDeleteOpen(false)}></div>
                    <div className="bg-card/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/20 rotate-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Delete Branch?</h3>
                        <p className="text-xs text-muted-foreground mb-8 font-bold">
                            Are you sure you want to delete <strong className="text-foreground uppercase">{branch.name}</strong>? This action cannot be undone and will delete all related data.
                        </p>
                        
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isPending} className="flex-1 bg-card border border-border hover:bg-muted/50 text-gray-800 font-bold py-3 rounded-xl transition-colors text-xs uppercase tracking-wider shadow-sm">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteConfirm} disabled={isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all text-xs uppercase tracking-wider disabled:opacity-50 flex justify-center items-center gap-2 hover:-translate-y-0.5">
                                {isPending ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Deleting...</span>
                                    </>
                                ) : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}