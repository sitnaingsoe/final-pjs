'use client'

import React, { useState } from 'react'
import { createStaff } from '@/server/actions/staff'

export default function CreateStaffForm() {
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
        } else {
            setError(res.error || "အမှားအယွင်းရှိပါသည်")
        }
        setIsSubmitting(false)
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
            >
                <span>➕</span> ဝန်ထမ်းအသစ် ထည့်မည်
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-black text-black">ဝန်ထမ်းအသစ် (Cashier/Staff) ထည့်ရန်</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black transition">
                        ✖
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">အမည် (Name)</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="ဥပမာ - မောင်မောင်"
                            className="w-full bg-white border border-gray-300 rounded-xl p-4 text-black focus:border-black focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">အီးမေးလ် (Login Email)</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="staff@example.com"
                            className="w-full bg-white border border-gray-300 rounded-xl p-4 text-black focus:border-black focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">လျှို့ဝှက်နံပါတ် (Password)</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="အနည်းဆုံး ၆ လုံး"
                            minLength={6}
                            className="w-full bg-white border border-gray-300 rounded-xl p-4 text-black focus:border-black focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(false)}
                            className="flex-1 bg-gray-200 hover:bg-slate-700 text-black font-bold py-4 rounded-xl transition-colors"
                        >
                            ပယ်ဖျက်မည်
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-gray-800 hover:to-gray-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'သိမ်းဆည်းနေပါသည်...' : 'ထည့်သွင်းမည်'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
