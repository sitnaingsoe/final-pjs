// app/(dashboard)/categories/page.tsx
import React from 'react'
import { getCategories, createCategory, deleteCategory } from '@/server/actions/categories'

export default async function CategoriesPage() {
    const result = await getCategories()
    const categories = result.data || []

    const handleDelete = async (id: string) => {
        'use server'
        await deleteCategory(id)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                        မီနူးအမျိုးအစားများ (Categories)
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">မုန့်ဟင်းခါး၊ အအေး၊ အကြော်စုံ စသည့် မီနူးအုပ်စုများကို ဤနေရာတွင် သတ်မှတ်နိုင်ပါသည်</p>
                </div>
                <div className="px-4 py-2 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="text-2xl">📂</span>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Categories</p>
                        <p className="text-xl font-black text-slate-200">{categories.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* (က) အမျိုးအစားအသစ်ထည့်ရန် ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-xl h-fit sticky top-6">
                    <h3 className="font-black text-slate-200 mb-6 flex items-center gap-2 text-lg">
                        <span className="text-orange-500">➕</span> အမျိုးအစားအသစ်ထည့်ရန်
                    </h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createCategory(formData)
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">အမျိုးအစားအမည် (Name)</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - အအေးနှင့်ဖျော်ရည်"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">အကျဉ်းချုပ်ဖော်ပြချက် (Description)</label>
                            <textarea
                                name="description"
                                placeholder="ဥပမာ - လန်းဆန်းစေသော ကော်ဖီ..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all h-24 resize-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-sm font-bold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0">
                            သိမ်းဆည်းမည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား အမျိုးအစားများပြဇယား (Right Column - Cards) */}
                <div className="lg:col-span-8">
                    {categories.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/60 p-12 text-center flex flex-col items-center justify-center">
                            <span className="text-5xl mb-4 opacity-50">📂</span>
                            <h3 className="text-lg font-bold text-slate-300">ဒေတာမရှိသေးပါ</h3>
                            <p className="text-sm text-slate-500 mt-2">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <div key={cat.id} className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-800/50 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 text-sm">
                                                    📂
                                                </div>
                                                <h4 className="font-bold text-slate-100 text-lg leading-tight group-hover:text-orange-400 transition-colors">
                                                    {cat.name}
                                                </h4>
                                            </div>
                                            <form action={handleDelete.bind(null, cat.id)}>
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
                                        <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                            {cat.description || <span className="italic opacity-50">ဖော်ပြချက် မရှိပါ</span>}
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">ဟင်းပွဲအရေအတွက်</span>
                                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs px-3 py-1 rounded-lg font-black tracking-wider">
                                            {cat._count.menuItems} ပွဲ
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