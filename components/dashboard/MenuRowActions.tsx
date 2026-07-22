// components/dashboard/MenuRowActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateMasterMenu, toggleMenuStatus } from '@/server/actions/centralMenu'
import InputField from '../ui/InputField'

export default function MenuRowActions({ menu, branches = [] }: { menu: any, branches?: any[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
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
                setIsOpen(false)
                router.refresh()
            } else {
                setError(res.error || 'သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်')
            }
        })
    }

    // အပိတ်/အဖွင့် (Soft Delete) လုပ်ခြင်း Handle
    const handleToggleStatus = () => {
        const msg = menu.isActive
            ? "ဤမီနူးကို ရောင်းချမှု ခေတ္တရပ်ဆိုင်း (Archive) မှာ သေချာပါသလား? (အရောင်းမှတ်တမ်းများ ပျက်စီးမည်မဟုတ်ပါ)"
            : "ဤမီနူးကို စနစ်ထဲတွင် ပြန်လည်အသုံးပြု (Active) မှာ သေချာပါသလား?"

        if (confirm(msg)) {
            startTransition(async () => {
                await toggleMenuStatus(menu.id, menu.isActive)
                router.refresh()
            })
        }
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {/* ✏️ Edit Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-3xs font-bold transition-colors"
            >
                ✏️ Edit
            </button>

            {/* 👁️ Toggle Status Button */}
            <button
                onClick={handleToggleStatus}
                disabled={isPending}
                className={`px-2.5 py-1.5 rounded-lg text-3xs font-bold transition-colors border ${menu.isActive
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    }`}
            >
                {menu.isActive ? "🚫 Archive" : "✅ Activate"}
            </button>

            {/* Edit Menu Dialog Box */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl w-full max-w-sm relative z-10 shadow-xl space-y-4">

                        <div className="border-b border-gray-100 pb-2">
                            <h3 className="text-sm font-black text-black uppercase">✏️ Edit Master Menu</h3>
                            <p className="text-3xs text-gray-400 font-bold uppercase">ဟင်းပွဲအမည်နှင့် စံနှုန်းစျေးနှုန်း ပြင်ဆင်ခြင်း</p>
                        </div>

                        {error && <div className="text-3xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>}

                        <form action={handleUpdateMenu} className="space-y-4">
                            <InputField label="Menu Name" name="name" defaultValue={menu.name} required disabled={isPending} />
                            <InputField label="Base Price (MMK)" type="number" name="basePrice" defaultValue={menu.basePrice} required disabled={isPending} />

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">Menu Image (ပုံ အသစ်ပြောင်းရန်)</label>
                                <input type="file" name="image" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-black" disabled={isPending} />
                                {menu.image && (
                                    <p className="text-3xs text-gray-400 mt-1">ယခုလက်ရှိပုံ: <a href={menu.image} target="_blank" className="text-black underline font-bold">ကြည့်ရန်</a></p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">Description</label>
                                <textarea name="description" defaultValue={menu.description || ''} className="w-full h-16 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-black text-black placeholder-gray-400 resize-none" disabled={isPending}></textarea>
                            </div>

                            {/* 🎯 ဆိုင်ခွဲများ ရွေးချယ်ရန် Checkbox စာရင်း */}
                            <div className="space-y-2">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">Active Branches (ဖြန့်ဝေမည့် ဆိုင်ခွဲများ)</label>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
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
                                <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">
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