// components/dashboard/AddonCategoryActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { updateAddonCategory, deleteAddonCategory } from '@/server/actions/addons'
import InputField from '../ui/InputField'

export default function AddonCategoryActions({ cat }: { cat: any }) {
    const [isPending, startTransition] = useTransition()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpdate = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await updateAddonCategory(cat.id, formData)
            if (res.success) {
                setIsEditOpen(false)
            } else {
                setError('အမှားအယွင်းရှိနေပါသည်')
            }
        })
    }

    const handleDeleteConfirm = () => {
        startTransition(async () => {
            const res = await deleteAddonCategory(cat.id)
            if (res && !res.success) {
                alert(res.error)
            }
            setIsDeleteOpen(false)
        })
    }

    return (
        <div className="flex items-center gap-1 shrink-0">
            {/* Edit Button */}
            <button onClick={() => setIsEditOpen(true)} className="p-1.5 text-gray-500 hover:text-black hover:bg-black/5 rounded-lg transition-colors" title="ပြင်ဆင်မည်">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
            </button>
            
            {/* Delete Button */}
            <button onClick={() => setIsDeleteOpen(true)} disabled={isPending} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="ဖျက်မည်">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>

            {/* Edit Dialog Box Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsEditOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6 flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M12 22h6"/><path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 17l-4 1 1-4Z"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-black tracking-tight">Edit Addon</h3>
                                    <p className="text-3xs text-gray-500 mt-0.5 font-medium uppercase tracking-wider">အပိုပစ္စည်းအုပ်စု ပြင်ဆင်ရန်</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <form action={handleUpdate} className="space-y-4">
                                <InputField label="Category Name" name="name" defaultValue={cat.name} required disabled={isPending} />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Min Select" type="number" name="minSelect" defaultValue={cat.minSelect} disabled={isPending} />
                                    <InputField label="Max Select" type="number" name="maxSelect" defaultValue={cat.maxSelect} disabled={isPending} />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsEditOpen(false)} className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors">Cancel</button>
                                    <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                                        {isPending ? (
                                            <>
                                                <svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Saving...</span>
                                            </>
                                        ) : "Save"}
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
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsDeleteOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 p-6 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </div>
                        <h3 className="text-lg font-black text-black mb-2">Delete Addon Group?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete <strong className="text-black">{cat.name}</strong>? All addons within this group will also be deleted.
                        </p>
                        
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isPending} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors text-sm">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteConfirm} disabled={isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 transition-colors text-sm disabled:opacity-50">
                                {isPending ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}