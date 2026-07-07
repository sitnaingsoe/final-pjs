// components/dashboard/MenuRowActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateMasterMenu, toggleMenuStatus } from '@/server/actions/centralMenu'
import InputField from '../ui/InputField'

export default function MenuRowActions({ menu }: { menu: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // ပြင်ဆင်မှု သိမ်းဆည်းခြင်း Handle
    const handleUpdateMenu = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await updateMasterMenu(menu.id, formData)
            if (res.success) {
                setIsOpen(false)
                router.refresh()
            } else {
                setError('error')
            }
        })
    }

    // အပိတ်/အဖွင့် (Soft Delete) လုပ်ခြင်း Handle
    const handleToggleStatus = () => {
        const msg = menu.isActive
            ? "ဤမီနူးကို ရောင်းချမှု ခေတ္တရပ်ဆိုင်း (Archive) မှာ သေချာပါသလား? (အရောင်းမှတ်တမ်းများ ပျက်စီးမည်မဟုတ်ပါ)"
            : "ဤမီနူးကို စနစ်ထဲတွင် ပြန်လည်အသုံးပြု (Active) မှာ သေჩာပါသလား?"

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
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-3xs font-bold transition"
            >
                ✏️ Edit
            </button>

            {/* 👁️ Toggle Status Button */}
            <button
                onClick={handleToggleStatus}
                disabled={isPending}
                className={`px-2.5 py-1.5 rounded-lg text-3xs font-bold transition border ${menu.isActive
                    ? 'bg-red-950/20 border-red-900 text-red-400 hover:bg-red-900/30'
                    : 'bg-green-950/20 border-green-800 text-green-400 hover:bg-green-900/30'
                    }`}
            >
                {menu.isActive ? "🚫 Archive" : "✅ Activate"}
            </button>

            {/* Edit Menu Dialog Box */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl space-y-4">

                        <div className="border-b border-slate-900 pb-2">
                            <h3 className="text-sm font-black text-orange-500 uppercase">✏️ Edit Master Menu</h3>
                            <p className="text-3xs text-slate-500 font-bold uppercase">ဟင်းပွဲအမည်နှင့် စံနှုန်းစျေးနှုန်း ပြင်ဆင်ခြင်း</p>
                        </div>

                        {error && <div className="text-3xs text-red-400 bg-red-950/20 p-2 rounded-lg">{error}</div>}

                        <form action={handleUpdateMenu} className="space-y-4">
                            <InputField label="Menu Name" name="name" defaultValue={menu.name} required disabled={isPending} />
                            <InputField label="Base Price (MMK)" type="number" name="basePrice" defaultValue={menu.basePrice} required disabled={isPending} />

                            <div className="space-y-1">
                                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">Description</label>
                                <textarea name="description" defaultValue={menu.description || ''} className="w-full h-16 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-orange-500 text-white placeholder-slate-600 resize-none" disabled={isPending}></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                                <button type="button" onClick={() => setIsOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
                                <button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
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