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
                setError('error')
            }
        })
    }

    // Delete Handle
    const handleDelete = () => {
        if (confirm("ဤဆိုင်ခွဲနှင့် သက်ဆိုင်သော အချက်အလက်များအားလုံး အပြီးတိုင် ပျက်စီးသွားပါမည်။ သေချာပါသလား?")) {
            startTransition(async () => {
                const res = await deleteBranch(branch.id)
                if (res.success) {
                    setIsDeleteOpen(false)
                    router.refresh()
                } else {
                    alert("ဖျက်ဆီးရခြင်း မအောင်မြင်ပါ")
                }
            })
        }
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {/* 📝 Edit Button */}
            <button
                onClick={() => setIsEditOpen(true)}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-3xs font-bold transition"
            >
                ✏️ Edit
            </button>

            {/* 🗑️ Delete Button */}
            <button
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-600 px-2.5 py-1.5 rounded-lg text-3xs font-bold transition disabled:opacity-50"
            >
                🗑️ Delete
            </button>

            {/* 🛠️ Edit Dialog Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setIsEditOpen(false)}></div>
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-md relative z-10 shadow-2xl space-y-4">
                        <div className="border-b border-gray-100 pb-2">
                            <h3 className="text-sm font-black text-black uppercase">📝 Edit Branch Profile</h3>
                            <p className="text-3xs text-gray-400 font-bold uppercase">ဆိုင်ခွဲအချက်အလက်များ ပြင်ဆင်ခြင်း</p>
                        </div>

                        {error && <div className="text-3xs text-red-600 bg-red-950/20 border border-red-900 p-2 rounded-lg">{error}</div>}

                        <form action={handleUpdate} className="space-y-4">
                            <InputField label="Branch Name" name="branchName" defaultValue={branch.name} required disabled={isPending} />
                            <InputField label="Address" name="address" defaultValue={branch.address || ''} disabled={isPending} />
                            <InputField label="Phone" name="phone" defaultValue={branch.phone || ''} disabled={isPending} />

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
                                <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold">
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