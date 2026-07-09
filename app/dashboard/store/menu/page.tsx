// app/(dashboard)/menu/page.tsx
import React from 'react'
import { getMenuItems, createMenuItem, deleteMenuItem } from '@/server/actions/menu'
import { getCategories } from '@/server/actions/categories'

export default async function MenuPage() {
    const [menuResult, catResult] = await Promise.all([getMenuItems(), getCategories()])

    const menuItems = menuResult.data || []
    const categories = catResult.data || []

    const handleDelete = async (id: string) => {
        'use server'
        await deleteMenuItem(id)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                        စားစရာ မီနူးများ (Menu Items)
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">ဟင်းပွဲများ၊ မုန့်များနှင့် ဖျော်ရည်များကို ဤနေရာတွင် ထည့်သွင်းနိုင်ပါသည်</p>
                </div>
                <div className="px-4 py-2 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="text-2xl">🍔</span>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Items</p>
                        <p className="text-xl font-black text-slate-200">{menuItems.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* (က) မီနူးအသစ်ထည့်ရန် ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-xl h-fit sticky top-6">
                    <h3 className="font-black text-slate-200 mb-6 flex items-center gap-2 text-lg">
                        <span className="text-orange-500">➕</span> ဟင်းပွဲအသစ် ထည့်မည်
                    </h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createMenuItem(formData)
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ဟင်းပွဲ/မုန့် အမည်</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - ကြက်သားတုတ်ထိုး"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ဈေးနှုန်း (MMK)</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="ဥပမာ - ၃၅၀၀"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">အုပ်စု ရွေးချယ်ရန်</label>
                            <select
                                name="categoryId"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
                                required
                            >
                                <option value="" className="text-slate-500">-- အမျိုးအစား ရွေးပါ --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ပါဝင်ပစ္စည်း / ဖော်ပြချက်</label>
                            <textarea
                                name="description"
                                placeholder="ဥပမာ - ကြက်သားသန့်သန့်..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all h-24 resize-none"
                            />
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-sm font-bold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0">
                            မီနူးထဲသို့ ထည့်မည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား မီနူးများ (Right Column - Grid Cards) */}
                <div className="lg:col-span-8">
                    {menuItems.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/60 p-12 text-center flex flex-col items-center justify-center">
                            <span className="text-5xl mb-4 opacity-50">🍽️</span>
                            <h3 className="text-lg font-bold text-slate-300">မီနူးများ မရှိသေးပါ</h3>
                            <p className="text-sm text-slate-500 mt-2">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {menuItems.map((item) => (
                                <div key={item.id} className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-800/50 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-bold text-slate-100 text-lg leading-tight group-hover:text-orange-400 transition-colors">
                                                {item.name}
                                            </h4>
                                            <form action={handleDelete.bind(null, item.id)}>
                                                <button
                                                    type="submit"
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="ဖျက်မည်"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </form>
                                        </div>
                                        <span className="inline-block mt-2 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-2xs font-bold uppercase tracking-wider rounded-md">
                                            {item.category?.name || 'Uncategorized'}
                                        </span>
                                        <p className="text-sm text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                                            {item.description || <span className="italic opacity-50">ဖော်ပြချက် မရှိပါ</span>}
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-end justify-between">
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Price</span>
                                        <div className="text-xl font-black text-slate-200">
                                            {item.price.toLocaleString()} <span className="text-sm text-slate-500">MMK</span>
                                        </div>
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