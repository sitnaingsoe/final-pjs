// components/dashboard/StaffRowActions.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resetStaffPassword, toggleStaffStatus } from '@/server/actions/staff'
import InputField from '../ui/InputField'

export default function StaffRowActions({ staff }: { staff: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePasswordReset = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await resetStaffPassword(Number(staff.id), formData)
            if (res.success) {
                setIsOpen(false)
                alert("Password ကို အောင်မြင်စွာ ပြောင်းလဲပေးလိုက်ပါပြီဗျာ")
                router.refresh()
            } else {
                setError('error')
            }
        })
    }

    const handleStatusToggle = () => {
        const msg = staff.isActive !== false ? "ဤဝန်ထမ်းကို ခေတ္တဆိုင်းငံ့ (Suspend) ထားမှာ သေချာပါသလား?" : "အကောင့်ကို ပြန်လည်ဖွင့်ပေးမှာ သေချာပါသလား?"
        if (confirm(msg)) {
            startTransition(async () => {
                await toggleStaffStatus(staff.id, staff.isActive !== false)
                router.refresh()
            })
        }
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {/* 🔑 Reset Pass ခလုတ် */}
            <button
                onClick={() => setIsOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-1 rounded-md text-3xs font-bold transition"
            >
                🔑 Reset Pass
            </button>

            {/* 🚫 Block / Unblock ခလုတ် */}
            <button
                onClick={handleStatusToggle}
                disabled={isPending}
                className={`px-2 py-1 rounded-md text-3xs font-bold transition border ${staff.isActive !== false
                    ? 'bg-red-950/20 border-red-900 text-red-400 hover:bg-red-900/30'
                    : 'bg-green-950/20 border-green-800 text-green-400 hover:bg-green-900/30'
                    }`}
            >
                {staff.isActive !== false ? "🚫 Suspend" : "✅ Unsuspend"}
            </button>

            {/* Reset Password Dialog Box */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl space-y-4">
                        <div>
                            <h3 className="text-xs font-black text-orange-500 uppercase">🔑 Force Password Reset</h3>
                            <p className="text-3xs text-slate-500 font-bold mt-0.5">{staff.name} အတွက် လျှို့ဝှက်နံပါတ်အသစ် သတ်မှတ်ရန်</p>
                        </div>

                        {error && <div className="text-3xs text-red-400 bg-red-950/20 p-2 rounded-lg">{error}</div>}

                        <form action={handlePasswordReset} className="space-y-4">
                            <InputField
                                label="New Password"
                                type="password"
                                name="newPassword"
                                placeholder="အနည်းဆုံး ၆ လုံး"
                                required
                                disabled={isPending}
                            />

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                                <button type="button" onClick={() => setIsOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-3xs font-bold">Cancel</button>
                                <button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-3xs font-bold">
                                    {isPending ? "Updating..." : "Confirm Change"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}