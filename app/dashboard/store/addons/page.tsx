// app/(dashboard)/addons/page.tsx
import React from 'react'
import {
    getAddonCategories,
    createAddonCategory,
    createAddon,
    getMenuItemsSimple,
    linkMenuWithAddonCategory
} from '@/server/actions/addons'

export default async function AddonsPage() {
    const result = await getAddonCategories()
    const addonCategories = result.data || []

    const menuResult = await getMenuItemsSimple()
    const menuItems = menuResult.data || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                    အပိုထပ်ဆောင်း ပစ္စည်းများ (Addons)
                </h2>
                <p className="text-sm text-slate-400 mt-1">"အသားတိုး"၊ "အချို/အစပ်" စသည့် အပိုပစ္စည်းအုပ်စုများနှင့် ဟင်းပွဲများကို စိတ်ကြိုက် ချိတ်ဆက်ပါ</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* === 🏢 ဘယ်ဘက်ခြမ်း: ဖောင်များ စုစည်းမှု (Forms) === */}
                <div className="lg:col-span-5 space-y-6">

                    {/* ဖောင် (၁) - အပိုပစ္စည်းအုပ်စု ဆောက်ရန် */}
                    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50 group-hover:bg-orange-500 transition-colors"></div>
                        <h3 className="font-black text-slate-200 mb-5 text-sm flex items-center gap-2">
                            <span className="text-orange-500">၁။</span> အပိုပစ္စည်းအုပ်စု ဆောက်ရန်
                        </h3>
                        <form action={async (formData) => { 'use server'; await createAddonCategory(formData) }} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">အုပ်စုအမည်</label>
                                <input type="text" name="name" placeholder="ဥပမာ - အသားတိုးရန်" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">အနည်းဆုံး ရွေးရမည်</label>
                                    <input type="number" name="minSelect" defaultValue={0} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">အများဆုံး ရွေးနိုင်မည်</label>
                                    <input type="number" name="maxSelect" defaultValue={1} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-xl transition-all border border-slate-700">
                                ➕ အုပ်စုဆောက်မည်
                            </button>
                        </form>
                    </div>

                    {/* ဖောင် (၂) - ပစ္စည်းအသေးစိတ်နှင့် စျေးနှုန်းထည့်ရန် */}
                    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50 group-hover:bg-rose-500 transition-colors"></div>
                        <h3 className="font-black text-slate-200 mb-5 text-sm flex items-center gap-2">
                            <span className="text-rose-500">၂။</span> ပစ္စည်းအသေးစိတ်နှင့် စျေးနှုန်းထည့်ရန်
                        </h3>
                        <form action={async (formData) => { 'use server'; await createAddon(formData) }} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ဘယ်အုပ်စုထဲ ထည့်မည်နည်း</label>
                                <select name="addonCategoryId" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white appearance-none focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all" required>
                                    <option value="" className="text-slate-500">-- အုပ်စုရွေးချယ်ပါ --</option>
                                    {addonCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ပစ္စည်းအမည်</label>
                                <input type="text" name="name" placeholder="ဥပမာ - ကြက်ဥပြုတ်" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ထပ်တိုးစျေးနှုန်း (MMK)</label>
                                <input type="number" name="price" placeholder="ဥပမာ - ၅၀၀" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all" required />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-500/20 transform hover:-translate-y-0.5 active:translate-y-0">
                                🚀 ပစ္စည်းအသစ် ထည့်မည်
                            </button>
                        </form>
                    </div>

                    {/* ဖောင် (၃) - ဟင်းပွဲနှင့် အပိုပစ္စည်းအုပ်စု ချိတ်ဆက်ရန် */}
                    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/60 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></div>
                        <h3 className="font-black text-slate-200 mb-5 text-sm flex items-center gap-2">
                            <span className="text-blue-500">၃။</span> ဟင်းပွဲနှင့် အပိုပစ္စည်းအုပ်စု ချိတ်ဆက်ရန်
                        </h3>
                        <form action={async (formData) => { 'use server'; await linkMenuWithAddonCategory(formData) }} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">မည်သည့် မီနူးဟင်းပွဲအတွက်လဲ</label>
                                <select name="menuItemId" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required>
                                    <option value="" className="text-slate-500">-- ဟင်းပွဲရွေးချယ်ပါ --</option>
                                    {menuItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">မည်သည့် အပိုပစ္စည်းအုပ်စု ထည့်မည်လဲ</label>
                                <select name="addonCategoryId" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required>
                                    <option value="" className="text-slate-500">-- အပိုပစ္စည်းအုပ်စု ရွေးချယ်ပါ --</option>
                                    {addonCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-bold py-3 rounded-xl transition-all border border-blue-500/30 hover:border-blue-400">
                                🔗 မီနူးနှင့် အုပ်စု ချိတ်ဆက်မည်
                            </button>
                        </form>
                    </div>

                </div>

                {/* === 📋 ညာဘက်ခြမ်း: လက်ရှိ ရှိပြီးသား ဒေတာပြသမှု (Display) === */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="font-bold text-slate-300 flex items-center gap-2">
                        📋 လက်ရှိ ရှိပြီးသား အပိုပစ္စည်းများနှင့် အုပ်စုများ
                    </h3>

                    {addonCategories.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/60 p-12 text-center text-slate-500">
                            ဒေတာများ မရှိသေးပါ။
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addonCategories.map(cat => (
                                <div key={cat.id} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-6 rounded-2xl shadow-lg hover:border-slate-700 transition-colors">
                                    
                                    {/* အုပ်စု Header */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800/60 pb-4 mb-4 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                                                📂
                                            </div>
                                            <span className="font-black text-slate-200 text-lg">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider shadow-inner">
                                                ရွေးချယ်မှု: {cat.minSelect} မှ {cat.maxSelect} ခုထိ
                                            </span>
                                        </div>
                                    </div>

                                    {/* အပိုပစ္စည်းများ List */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">🔹 ပါဝင်သော အပိုပစ္စည်းများ</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {!cat.addons || cat.addons.length === 0 ? (
                                                <p className="text-sm text-slate-600 italic col-span-2">ဤအုပ်စုအောက်တွင် ပစ္စည်းမရှိသေးပါ။</p>
                                            ) : (
                                                cat.addons.map((addon: any) => (
                                                    <div key={addon.id} className="flex justify-between items-center bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-all group">
                                                        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{addon.name}</span>
                                                        <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">+{addon.price.toLocaleString()} MMK</span>
                                                    </div>
                                                ))
                                            )}
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