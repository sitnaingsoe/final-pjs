// components/dashboard/CategoryCardActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { updateCategory, deleteCategory } from '@/server/actions/categories'
import InputField from '../ui/InputField'

export default function CategoryCardActions({ cat }: { cat: any }) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpdate = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await updateCategory(cat.id, formData)
            if (res.success) {
                setIsOpen(false)
            } else {
                setError(res.error || "ပြင်ဆင်၍ မရပါ")
            }
        })
    }

    const handleDeleteClick = () => {
        if (confirm(`"${cat.name}" အမျိုးအစားကို အပြီးတိုင် ဖျက်မှာ သေချာပါသလား?`)) {
            startTransition(async () => {
                const res = await deleteCategory(cat.id)
                if (!res.success) alert(res.error)
            })
        }
    }

    return (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            {/* ✏️ Edit Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition"
                title="ပြင်ဆင်မည်"
            >
                ✏️
            </button>

            {/* 🗑️ Delete Button */}
            <button
                onClick={handleDeleteClick}
                disabled={isPending}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
                title="ဖျက်မည်"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Edit Dialog Box Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl space-y-4">
                        <div>
                            <h3 className="text-xs font-black text-orange-500 uppercase">✏️ Edit Category</h3>
                            <p className="text-3xs text-slate-500 font-bold mt-0.5">အုပ်စုအမည်နှင့် ဖော်ပြချက် ပြင်ဆင်ရန်</p>
                        </div>

                        {error && <div className="text-3xs text-red-400 bg-red-950/20 p-2 rounded-lg">⚠️ {error}</div>}

                        <form action={handleUpdate} className="space-y-4">
                            <InputField label="Category Name" name="name" defaultValue={cat.name} required disabled={isPending} />

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">Description</label>
                                <textarea name="description" defaultValue={cat.description || ''} className="w-full h-16 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-orange-500 text-white placeholder-slate-600 resize-none" disabled={isPending}></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                                <button type="button" onClick={() => setIsOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-3xs font-bold">Cancel</button>
                                <button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-3xs font-bold">
                                    {isPending ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}