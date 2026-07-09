// app/(dashboard)/discounts/page.tsx
import React from 'react'
import { getDiscounts, createDiscount, toggleDiscountStatus } from '@/server/actions/discounts'

export default async function DiscountsPage() {
    const result = await getDiscounts()
    const discounts = result.data || []

    const handleToggle = async (id: string, currentStatus: boolean) => {
        'use server'
        await toggleDiscountStatus(id, currentStatus)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                        လျှော့စျေးနှင့် ပရိုမိုးရှင်း (Discounts)
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">ဆိုင်၏ ရာခိုင်နှုန်းအလိုက် သို့မဟုတ် ပမာဏအလိုက် လျှော့စျေးများကို ဤနေရာတွင် သတ်မှတ်ပါ</p>
                </div>
                <div className="px-4 py-2 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="text-2xl">🏷️</span>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Promos</p>
                        <p className="text-xl font-black text-slate-200">{discounts.filter(d => d.isActive).length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* (က) ပရိုမိုးရှင်းအသစ် ဆောက်မည့်ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-xl h-fit sticky top-6">
                    <h3 className="font-black text-slate-200 mb-6 flex items-center gap-2 text-lg">
                        <span className="text-orange-500">➕</span> ပရိုမိုးရှင်းအသစ် တည်ဆောက်ရန်
                    </h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createDiscount(formData)
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ကမ်ပိန်းအမည် (Campaign Name)</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - မိုးရာသီအထူး လျှော့စျေး ၁၀%"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">လျှော့ပေးမည့် ပုံစံ (Type)</label>
                            <select
                                name="type"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
                                required
                            >
                                <option value="PERCENTAGE">ရာခိုင်နှုန်းအလိုက် (%)</option>
                                <option value="FIXED">ပမာဏအလိုက် တိုက်ရိုက်လျှော့ရန် (MMK)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">တန်ဖိုး (Value)</label>
                            <input
                                type="number"
                                name="value"
                                placeholder="ဥပမာ - ၁၀ သို့မဟုတ် ၁၀၀၀"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-sm font-bold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0">
                            ပရိုမိုးရှင်း စတင်မည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား ပရိုမိုးရှင်းများ (Right Column - Cards) */}
                <div className="lg:col-span-8">
                    {discounts.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/60 p-12 text-center flex flex-col items-center justify-center">
                            <span className="text-5xl mb-4 opacity-50">🏷️</span>
                            <h3 className="text-lg font-bold text-slate-300">ပရိုမိုးရှင်းများ မရှိသေးပါ</h3>
                            <p className="text-sm text-slate-500 mt-2">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {discounts.map((disc) => (
                                <div key={disc.id} className={`group bg-slate-900/40 backdrop-blur-xl border ${disc.isActive ? 'border-orange-500/30 shadow-orange-500/5' : 'border-slate-800/60 opacity-80'} rounded-2xl p-5 hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between`}>
                                    <div>
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${disc.isActive ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                                    🏷️
                                                </div>
                                                <h4 className={`font-bold text-lg leading-tight transition-colors ${disc.isActive ? 'text-slate-100 group-hover:text-orange-400' : 'text-slate-400'}`}>
                                                    {disc.name}
                                                </h4>
                                            </div>
                                            
                                            <span className={`text-xs px-2.5 py-1 rounded-md font-black uppercase tracking-wider ${disc.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                                {disc.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-400 mt-2">
                                            {disc.type === 'PERCENTAGE' ? 'ရာခိုင်နှုန်းအလိုက် လျှော့စျေး' : 'ပမာဏအလိုက် လျှော့စျေး'}
                                        </p>
                                        
                                        <div className="mt-3">
                                            <span className="text-2xl font-black text-slate-200">
                                                {disc.type === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value.toLocaleString()} MMK`}
                                            </span>
                                            <span className="text-xs text-slate-500 font-bold ml-2">OFF</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                                        <form action={handleToggle.bind(null, disc.id, disc.isActive)} className="w-full">
                                            <button
                                                type="submit"
                                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${disc.isActive
                                                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                                        : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30'
                                                    }`}
                                            >
                                                {disc.isActive ? '🛑 ယာယီပိတ်မည် (Disable)' : '⚡ ပြန်ဖွင့်မည် (Activate)'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}