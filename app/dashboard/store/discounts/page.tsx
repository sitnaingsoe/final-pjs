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
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500">
                        လျှော့စျေးနှင့် ပရိုမိုးရှင်း (Discounts)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">ဆိုင်၏ ရာခိုင်နှုန်းအလိုက် သို့မဟုတ် ပမာဏအလိုက် လျှော့စျေးများကို ဤနေရာတွင် သတ်မှတ်ပါ</p>
                </div>
                <div className="px-4 py-2 bg-gray-50/50 backdrop-blur-md rounded-xl border border-gray-200 flex items-center gap-3">
                    <span className="text-2xl">🏷️</span>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Promos</p>
                        <p className="text-xl font-black text-gray-800">{discounts.filter(d => d.isActive).length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* (က) ပရိုမိုးရှင်းအသစ် ဆောက်မည့်ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-gray-50/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/60 shadow-xl h-fit sticky top-6">
                    <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2 text-lg">
                        <span className="text-black">➕</span> ပရိုမိုးရှင်းအသစ် တည်ဆောက်ရန်
                    </h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createDiscount(formData)
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">ကမ်ပိန်းအမည် (Campaign Name)</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - မိုးရာသီအထူး လျှော့စျေး ၁၀%"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-black placeholder-slate-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">လျှော့ပေးမည့် ပုံစံ (Type)</label>
                            <select
                                name="type"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none"
                                required
                            >
                                <option value="PERCENTAGE">ရာခိုင်နှုန်းအလိုက် (%)</option>
                                <option value="FIXED">ပမာဏအလိုက် တိုက်ရိုက်လျှော့ရန် (MMK)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">တန်ဖိုး (Value)</label>
                            <input
                                type="number"
                                name="value"
                                placeholder="ဥပမာ - ၁၀ သို့မဟုတ် ၁၀၀၀"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-black placeholder-slate-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-gray-800 hover:to-gray-500 text-black text-sm font-bold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0">
                            ပရိုမိုးရှင်း စတင်မည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား ပရိုမိုးရှင်းများ (Right Column - Cards) */}
                <div className="lg:col-span-8">
                    {discounts.length === 0 ? (
                        <div className="bg-gray-50/40 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-12 text-center flex flex-col items-center justify-center">
                            <span className="text-5xl mb-4 opacity-50">🏷️</span>
                            <h3 className="text-lg font-bold text-gray-700">ပရိုမိုးရှင်းများ မရှိသေးပါ</h3>
                            <p className="text-sm text-gray-400 mt-2">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {discounts.map((disc) => (
                                <div key={disc.id} className={`group bg-gray-50/40 backdrop-blur-xl border ${disc.isActive ? 'border-black/30 shadow-orange-500/5' : 'border-gray-200/60 opacity-80'} rounded-2xl p-5 hover:bg-gray-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 flex flex-col justify-between`}>
                                    <div>
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${disc.isActive ? 'bg-black/20 text-gray-800 border border-black/30' : 'bg-gray-200 text-gray-400 border border-gray-300'}`}>
                                                    🏷️
                                                </div>
                                                <h4 className={`font-bold text-lg leading-tight transition-colors ${disc.isActive ? 'text-gray-900 group-hover:text-gray-800' : 'text-gray-500'}`}>
                                                    {disc.name}
                                                </h4>
                                            </div>
                                            
                                            <span className={`text-xs px-2.5 py-1 rounded-md font-black uppercase tracking-wider ${disc.isActive ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-gray-200 text-gray-400 border border-gray-300'}`}>
                                                {disc.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 mt-2">
                                            {disc.type === 'PERCENTAGE' ? 'ရာခိုင်နှုန်းအလိုက် လျှော့စျေး' : 'ပမာဏအလိုက် လျှော့စျေး'}
                                        </p>
                                        
                                        <div className="mt-3">
                                            <span className="text-2xl font-black text-gray-800">
                                                {disc.type === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value.toLocaleString()} MMK`}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold ml-2">OFF</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center justify-between gap-2">
                                        <form action={handleToggle.bind(null, disc.id, disc.isActive)} className="flex-1">
                                            <button
                                                type="submit"
                                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${disc.isActive
                                                        ? 'bg-gray-200 hover:bg-slate-700 text-gray-700 border-gray-300'
                                                        : 'bg-black/10 hover:bg-black/20 text-gray-800 border-black/30'
                                                    }`}
                                            >
                                                {disc.isActive ? '🛑 ယာယီပိတ်မည်' : '⚡ ပြန်ဖွင့်မည်'}
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            const { deleteDiscount } = await import('@/server/actions/discounts')
                                            await deleteDiscount(disc.id)
                                        }}>
                                            <button
                                                type="submit"
                                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors"
                                                title="အပြီးဖျက်မည် (Delete)"
                                            >
                                                🗑️
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