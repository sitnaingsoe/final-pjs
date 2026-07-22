// components/dashboard/CreateMenuDialog.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createMasterMenu } from '@/server/actions/centralMenu'
import InputField from '../ui/InputField'

export default function CreateMenuDialog({ branches }: { branches: any[] }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedBranches, setSelectedBranches] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

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
            <button onClick={() => setIsOpen(true)} className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm">
                ➕ Create Master Menu
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl w-full max-w-md relative z-10 shadow-xl space-y-4">

                        <div className="border-b border-gray-100 pb-2">
                            <h3 className="text-sm font-black text-black uppercase">🍔 Add Master Product</h3>
                            <p className="text-3xs text-gray-400 font-bold uppercase">ဟင်းပွဲအသစ်သတ်မှတ်၍ ဆိုင်ခွဲများသို့ တန်းဖြန့်ခြင်း</p>
                        </div>

                        {error && <div className="text-3xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>}

                        <form action={handleSubmit} className="space-y-4">
                            <InputField label="Menu Name (ဟင်းပွဲအမည်) *" name="name" placeholder="ဥပမာ - ကြက်သားတုတ်ထိုး" required disabled={isPending} />
                            <InputField label="Base Price (စံနှုန်းစျေးနှုန်း) *" type="number" name="basePrice" placeholder="0.00" required disabled={isPending} />

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">Menu Image (ပုံ)</label>
                                <input type="file" name="image" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-black" disabled={isPending} />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">Description (အညွှန်း)</label>
                                <textarea name="description" className="w-full h-16 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-black text-black placeholder-gray-400 resize-none" disabled={isPending}></textarea>
                            </div>

                            {/* 🎯 ဆိုင်ခွဲများ ရွေးချယ်ရန် Checkbox စာရင်း */}
                            <div className="space-y-2">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">Select Branches to Deploy (ဖြန့်ဝေမည့် ဆိုင်ခွဲများ)</label>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-24 overflow-y-auto space-y-2">
                                    {branches.map(branch => (
                                        <label key={branch.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={selectedBranches.includes(branch.id)}
                                                onChange={() => handleCheckboxChange(branch.id)}
                                                className="accent-black rounded border-gray-300 bg-white"
                                                disabled={isPending}
                                            />
                                            <span>{branch.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button type="button" onClick={() => setIsOpen(false)} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                                <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">
                                    {isPending ? "Deploying..." : "Save & Deploy"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}