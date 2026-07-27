'use client'

import React, { useState } from 'react'
import { createStaff } from '@/server/actions/staff'
import InputField from '../ui/InputField'
import { useRouter } from 'next/navigation'

export default function CreateStaffForm() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        
        const formData = new FormData(e.currentTarget)
        const res = await createStaff(formData)
        
        if (res.success) {
            setIsOpen(false)
            router.refresh()
        } else {
            setError(res.error || "အမှားအယွင်းရှိပါသည်")
        }
        setIsSubmitting(false)
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-bold px-6 py-3.5 rounded-[1rem] text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 overflow-hidden shrink-0"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                <span>Add Staff</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isSubmitting && setIsOpen(false)}></div>

                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-lg relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-white/60 to-white/40 border-b border-gray-100 p-8 flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-black tracking-tight">Create Staff Account</h3>
                                    <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">ဆိုင်ခွဲအတွက် ဝန်ထမ်းအကောင့်အသစ် ဖန်တီးရန်</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8 bg-white/40">
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <InputField label="Name (အမည်)" name="name" placeholder="e.g. John Doe" required disabled={isSubmitting} />
                                    <InputField label="Login Email (အီးမေးလ်)" type="email" name="email" placeholder="staff@example.com" required disabled={isSubmitting} />
                                    <InputField label="Password (လျှို့ဝှက်နံပါတ်)" type="password" name="password" placeholder="Min. 6 characters" minLength={6} required disabled={isSubmitting} />
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/50">
                                    <button type="button" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-black font-bold px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors shadow-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="group relative bg-black hover:bg-gray-900 text-white font-bold px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm Create</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
