// components/dashboard/AddonCategoryActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { updateAddonCategory, deleteAddonCategory } from '@/server/actions/addons'
import InputField from '../ui/InputField'

export default function AddonCategoryActions({ cat }: { cat: any }) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpdate = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await updateAddonCategory(cat.id, formData)
            if (res.success) setIsOpen(false)
            else setError('error')
        })
    }

    const handleDelete = () => {
        if (confirm(`"${cat.name}" အုပ်စုကို ဖျက်ပါက အောက်ရှိ အပိုပစ္စည်းများပါ အကုန်ပျက်ပါမည်။ သေချာပါသလား?`)) {
            startTransition(async () => {
                await deleteAddonCategory(cat.id)
            })
        }
    }

    return (
        <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setIsOpen(true)} className="p-1 text-gray-500 hover:text-gray-800 transition">✏️</button>
            <button onClick={handleDelete} disabled={isPending} className="p-1 text-gray-500 hover:text-red-600 transition disabled:opacity-50">🗑️</button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl space-y-4">
                        <div>
                            <h3 className="text-xs font-black text-black uppercase">✏️ Edit Addon Category</h3>
                            <p className="text-3xs text-gray-400 font-bold mt-0.5">အပိုပစ္စည်းအုပ်စု ပြင်ဆင်ရန်</p>
                        </div>
                        {error && <div className="text-3xs text-red-600 bg-red-950/20 p-2 rounded-lg">{error}</div>}
                        <form action={handleUpdate} className="space-y-4">
                            <InputField label="Category Name" name="name" defaultValue={cat.name} required disabled={isPending} />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="Min Select" type="number" name="minSelect" defaultValue={cat.minSelect} disabled={isPending} />
                                <InputField label="Max Select" type="number" name="maxSelect" defaultValue={cat.maxSelect} disabled={isPending} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-3xs font-bold">Cancel</button>
                                <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-xl text-3xs font-bold">{isPending ? "Saving..." : "Save"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}