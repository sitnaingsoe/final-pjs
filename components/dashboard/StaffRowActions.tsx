// components/dashboard/StaffRowActions.tsx
'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { resetStaffPassword, toggleStaffStatus } from '@/server/actions/staff'
import InputField from '../ui/InputField'

export default function StaffRowActions({ staff }: { staff: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isResetOpen, setIsResetOpen] = useState(false)
    const [isToggleOpen, setIsToggleOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const handlePasswordReset = (formData: FormData) => {
        startTransition(async () => {
            setError(null)
            const res = await resetStaffPassword(Number(staff.id), formData)
            if (res.success) {
                setIsResetOpen(false)
                alert("Password ကို အောင်မြင်စွာ ပြောင်းလဲပေးလိုက်ပါပြီဗျာ")
                router.refresh()
            } else {
                setError('အမှားအယွင်းရှိနေပါသည်')
            }
        })
    }

    const handleStatusToggleConfirm = () => {
        startTransition(async () => {
            const res = await toggleStaffStatus(staff.id, staff.isActive !== false)
            if (!res.success) {
                alert(res.error || "လုပ်ဆောင်ချက် မအောင်မြင်ပါ")
            }
            setIsToggleOpen(false)
            router.refresh()
        })
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {/* 🔑 Reset Pass Button */}
            <button
                onClick={() => setIsResetOpen(true)}
                className="group relative flex items-center justify-center w-8 h-8 bg-muted/50 hover:bg-black border border-border hover:border-primary text-muted-foreground hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
                title="Reset Password"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>

            {/* 🚫 Suspend / Unsuspend Button */}
            <button
                onClick={() => setIsToggleOpen(true)}
                className={`group relative flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden border ${staff.isActive !== false
                    ? 'bg-red-50 hover:bg-red-600 border-red-200 hover:border-red-600 text-red-600 hover:text-white'
                    : 'bg-green-50 hover:bg-green-600 border-green-200 hover:border-green-600 text-green-600 hover:text-white'
                    }`}
                title={staff.isActive !== false ? "Suspend Staff" : "Unsuspend Staff"}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {staff.isActive !== false ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-colors"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                )}
            </button>

            {/* Reset Password Dialog Box Modal */}
            {isResetOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsResetOpen(false)}></div>
                    <div className="bg-card rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-card border-b border-border/50 p-6 flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">Reset Password</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-widest">{staff.name} အတွက် လျှို့ဝှက်နံပါတ်အသစ်</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-card">
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span className="font-bold">{error}</span>
                                </div>
                            )}

                            <form action={handlePasswordReset} className="space-y-5">
                                <InputField
                                    label="New Password"
                                    type="password"
                                    name="newPassword"
                                    placeholder="အနည်းဆုံး ၆ လုံး"
                                    required
                                    disabled={isPending}
                                />

                                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                    <button type="button" onClick={() => setIsResetOpen(false)} className="bg-card border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-colors shadow-sm">Cancel</button>
                                    <button type="submit" disabled={isPending} className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5">
                                        {isPending ? (
                                            <>
                                                <svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Updating...</span>
                                            </>
                                        ) : "Confirm Change"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Custom Toggle Status Dialog Box Modal */}
            {isToggleOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsToggleOpen(false)}></div>
                    <div className="bg-card rounded-[2rem] w-full max-w-sm relative z-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${staff.isActive !== false ? 'bg-red-500 shadow-red-500/20 rotate-3' : 'bg-green-500 shadow-green-500/20 -rotate-3'}`}>
                            {staff.isActive !== false ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">{staff.isActive !== false ? "Suspend Staff?" : "Unsuspend Staff?"}</h3>
                        <p className="text-xs text-muted-foreground mb-8 font-bold">
                            {staff.isActive !== false
                                ? <>Are you sure you want to suspend <strong className="text-foreground uppercase">{staff.name}</strong>? They will not be able to log in.</>
                                : <>Are you sure you want to unsuspend <strong className="text-foreground uppercase">{staff.name}</strong>? They will regain access.</>
                            }
                        </p>
                        
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsToggleOpen(false)} disabled={isPending} className="flex-1 bg-card border border-border hover:bg-muted/50 text-gray-800 font-bold py-3 rounded-xl transition-colors text-xs uppercase tracking-wider shadow-sm">
                                Cancel
                            </button>
                            <button type="button" onClick={handleStatusToggleConfirm} disabled={isPending} className={`flex-1 font-black py-3 rounded-xl transition-all text-xs uppercase tracking-wider disabled:opacity-50 text-white shadow-lg hover:-translate-y-0.5 ${staff.isActive !== false ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'}`}>
                                {isPending ? "Processing..." : (staff.isActive !== false ? "Yes, Suspend" : "Yes, Unsuspend")}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}