// app/dashboard/categories/page.tsx
import React from 'react'
import { getCategories, createCategory } from '@/server/actions/categories'
import CategoryCardActions from '@/components/dashboard/CategoryCardActions'

export default async function CategoriesPage() {
    const result = await getCategories()
    const categories = result.data || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 uppercase tracking-wider">
                        မန္တလေးဆိုင်ခွဲ အမျိုးအစားများ (Categories)
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">မုန့်ဟင်းခါးClasses၊ အအေး၊ အကြော်စုံ စသည့် မီနူးအုပ်စုများကို သတ်မှတ်နိုင်ပါသည်</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-md">
                    <span className="text-xl">📂</span>
                    <div>
                        <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Total Categories</p>
                        <p className="text-sm font-black text-gray-800 font-mono">{categories.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* (က) အမျိုးအစားအသစ်ထည့်ရန် ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl h-fit sticky top-6">
                    <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <span className="text-black">➕</span> အမျိုးအစားအသစ်ထည့်ရန်
                    </h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createCategory(formData)
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">အမျိုးအစားအမည် (Name) *</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - အအေးနှင့်ဖျော်ရည်"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black placeholder-slate-600 focus:outline-none focus:border-black transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">အကျဉ်းချုပ်ဖော်ပြချက် (Description)</label>
                            <textarea
                                name="description"
                                placeholder="ဥပမာ - လန်းဆန်းစေသော ကော်ဖီ..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black placeholder-slate-600 focus:outline-none focus:border-black transition-all h-20 resize-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md">
                            🚀 သိမ်းဆည်းမည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား အမျိုးအစားများပြကတ်ပြားများ (Right Column - Cards) */}
                <div className="lg:col-span-8">
                    {categories.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center shadow-inner">
                            <span className="text-4xl mb-3 opacity-40">📂</span>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">ဒေတာမရှိသေးပါ</h3>
                            <p className="text-3xs text-gray-300 mt-1 uppercase">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map((cat: any) => (
                                <div key={cat.id} className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-black/30 transition-all duration-300 flex flex-col justify-between shadow-xl relative">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-3 mb-2 overflow-hidden">
                                                <div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center text-gray-800 border border-black/20 text-xs shrink-0">
                                                    📂
                                                </div>
                                                <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-gray-800 transition-colors">
                                                    {cat.name}
                                                </h4>
                                            </div>

                                            {/* 🎯 Reusable Action Buttons (Edit & Delete Dialog Box) */}
                                            <CategoryCardActions cat={cat} />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                            {cat.description || <span className="italic opacity-30 text-3xs">ဖော်ပြချက် မရှိပါ</span>}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                   <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider">ဟင်းပွဲအရေအတွက်</span>
                                        <span className="bg-black/10 text-gray-800 border border-black/20 text-3xs px-2.5 py-1 rounded-lg font-black tracking-wider font-mono">
                                            {cat._count?.menuItems || 0} ပွဲ
                                        </span>
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