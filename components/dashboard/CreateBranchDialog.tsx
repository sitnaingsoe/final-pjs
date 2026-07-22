// components/dashboard/CreateBranchDialog.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { createBranchWithAdmin } from '@/server/actions/branch'
import { useRouter } from 'next/navigation'
import InputField from '../ui/InputField' // 👈 Reusable Input ကို ပြန်သုံးခြင်း

export default function CreateBranchDialog({ companyId }: { companyId: string }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

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
                className="bg-black hover:bg-gray-800 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md shrink-0"
            >
                ➕ Add New Branch
            </button>

            {/* Dialog Overlay & Box */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setIsOpen(false)}></div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl w-full max-w-xl relative z-10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">

                        {/* Title */}
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-md font-black text-black uppercase">🏢 Create Branch Admin Structure</h3>
                                <p className="text-3xs text-gray-500 mt-0.5">ဆိုင်ခွဲနှင့် စီမံခန့်ခွဲသူ အကောင့်သစ်ကို တစ်ပြိုင်နက် သတ်မှတ်ခြင်း</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} disabled={isPending} className="text-gray-400 hover:text-black text-sm font-bold">✕</button>
                        </div>

                        {/* Error Handling */}
                        {error && (
                            <div className="bg-red-950/40 border border-red-200 text-red-600 text-2xs p-3 rounded-xl font-medium">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form action={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Left Side: Branch Info */}
                                <div className="space-y-3 sm:border-r sm:border-gray-100 sm:pr-4">
                                    <p className="text-3xs font-black text-gray-400 uppercase tracking-wider">1. Branch Profile</p>
                                    <InputField label="Branch Name" name="branchName" placeholder="ဥပမာ - လှည်းတန်းဆိုင်ခွဲ" required disabled={isPending} />
                                    <InputField label="Address" name="address" placeholder="ဆိုင်ခွဲ တည်နေရာ လိပ်စာ" disabled={isPending} />
                                    <InputField label="Phone" name="phone" placeholder="ဆက်သွယ်ရန် ဖုန်းနံပါတ်" disabled={isPending} />
                                </div>

                                {/* Right Side: Admin User Info */}
                                <div className="space-y-3">
                                    <p className="text-3xs font-black text-gray-400 uppercase tracking-wider">2. Assigned Manager</p>
                                    <InputField label="Manager Name" name="adminName" placeholder="မန်နေဂျာ အမည်" required disabled={isPending} />
                                    <InputField label="Email Address" type="email" name="adminEmail" placeholder="manager@company.com" required disabled={isPending} />
                                    <InputField label="Password" type="password" name="adminPassword" placeholder="••••••••" required disabled={isPending} />
                                </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsOpen(false)} disabled={isPending} className="bg-gray-50 hover:bg-slate-850 border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-md disabled:bg-gray-200 disabled:text-gray-400 flex items-center gap-1.5">
                                    {isPending ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            <span>Building...</span>
                                        </>
                                    ) : (
                                        "Confirm Create"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}