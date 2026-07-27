// app/dashboard/categories/page.tsx
import React from 'react'
import { getCategories, createCategory } from '@/server/actions/categories'
import CategoryCardActions from '@/components/dashboard/CategoryCardActions'

export default async function CategoriesPage() {
    const result = await getCategories()
    const categories = result.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Categories</h1>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">မီနူးအုပ်စုများကို သတ်မှတ်နိုင်ပါသည်</p>
                    </div>
                </div>
                <div className="px-5 py-3.5 bg-white rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm shrink-0">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Categories</p>
                        <p className="text-xl font-black text-black leading-none mt-1">{categories.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* (က) အမျိုးအစားအသစ်ထည့်ရန် ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:p-8 h-fit lg:sticky top-6 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-gray-200/50">
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-black">New Category <span className="font-bold text-gray-400 tracking-normal ml-1 text-[10px]">(အသစ်ထည့်ရန်)</span></h2>
                    </div>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createCategory(formData)
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Category Name <span className="text-black">*</span></label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Beverages"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                            <textarea
                                name="description"
                                placeholder="Optional description..."
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md h-24 resize-none"
                            />
                        </div>
                        <button type="submit" className="w-full mt-2 relative bg-black hover:bg-gray-900 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            Save Category
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား အမျိုးအစားများပြကတ်ပြားများ (Right Column - Cards) */}
                <div className="lg:col-span-8">
                    {categories.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 p-16 text-center flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-5 border border-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Categories</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            {categories.map((cat: any) => (
                                <div key={cat.id} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-3 mb-2 overflow-hidden">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                                </div>
                                                <h4 className="font-black text-black text-sm uppercase tracking-wider truncate">
                                                    {cat.name}
                                                </h4>
                                            </div>

                                            {/* 🎯 Reusable Action Buttons (Edit & Delete Dialog Box) */}
                                            <CategoryCardActions cat={cat} />
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-2 font-bold leading-relaxed line-clamp-2">
                                            {cat.description || <span className="italic opacity-50">ဖော်ပြချက် မရှိပါ</span>}
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                            Items
                                        </span>
                                        <span className="bg-gray-50 text-black px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest font-mono border border-gray-200">
                                            {cat._count?.menuItems || 0}
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