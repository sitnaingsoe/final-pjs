// app/dashboard/addons/page.tsx
import React from 'react'
import {
    getAddonCategories,
    createAddonCategory,
    createAddon,
    getMenuItemsSimple,
    linkMenuWithAddonCategory
} from '@/server/actions/addons'
import AddonCategoryActions from '@/components/dashboard/AddonCategoryActions'

export default async function AddonsPage() {
    const result = await getAddonCategories()
    const addonCategories = result.data || []

    const menuResult = await getMenuItemsSimple()
    const menuItems = menuResult.data || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 uppercase tracking-wider">
                    အပိုထပ်ဆောင်း ပစ္စည်းများ (Addons)
                </h2>
                <p className="text-xs text-gray-500 mt-1">"အသားတိုး"၊ "အချို/အစပ်" စသည့် အပိုပစ္စည်းအုပ်စုများနှင့် ဟင်းပွဲများကို စိတ်ကြိုက် ချိတ်ဆက်ပါ</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* === 🏢 ဘယ်ဘက်ခြမ်း: ဖောင်များ စုစည်းမှု === */}
                <div className="lg:col-span-5 space-y-6">
                    {/* ဖောင် (၁) - အပိုပစ္စည်းအုပ်စု ဆောက်ရန် */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-black/50 group-hover:bg-black transition-colors"></div>
                        <h3 className="font-black text-gray-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                            <span className="text-black">၁။</span> အပိုပစ္စည်းအုပ်စု ဆောက်ရန်
                        </h3>
                        <form
                            action={async (formData) => {
                                'use server';
                                await createAddonCategory(formData); // 🎯 return တန်ဖိုးမယူတော့ဘဲ invoke သက်သက်ပဲလုပ်ခိုင်းပါသည်
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">အုပ်စုအမည်</label>
                                <input type="text" name="name" placeholder="ဥပမာ - အသားတိုးရန်" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black placeholder-slate-600 focus:outline-none focus:border-black" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">အနည်းဆုံး ရွေးရမည်</label>
                                    <input type="number" name="minSelect" defaultValue={0} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black focus:outline-none focus:border-black" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">အများဆုံး ရွေးနိုင်မည်</label>
                                    <input type="number" name="maxSelect" defaultValue={1} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black focus:outline-none focus:border-black" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-gray-50 hover:bg-gray-100 text-black text-xs font-bold py-2.5 rounded-xl transition border border-gray-200">
                                ➕ အုပ်စုဆောက်မည်
                            </button>
                        </form>
                    </div>

                    {/* ဖောင် (၂) - ပစ္စည်းအသေးစိတ်နှင့် စျေးနှုန်းထည့်ရန် */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50 group-hover:bg-rose-500 transition-colors"></div>
                        <h3 className="font-black text-gray-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                            <span className="text-rose-500">၂။</span> ပစ္စည်းအသေးစိတ်နှင့် စျေးနှုန်းထည့်ရန်
                        </h3>
                        <form
                            action={async (formData) => {
                                'use server';
                                await createAddon(formData);
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">ဘယ်အုပ်စုထဲ ထည့်မည်နည်း</label>
                                <select name="addonCategoryId" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black focus:outline-none focus:border-rose-500" required>
                                    <option value="">-- အုပ်စုရွေးချယ်ပါ --</option>
                                    {addonCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">ပစ္စည်းအမည်</label>
                                <input type="text" name="name" placeholder="ဥပမာ - ကြက်ဥပြုတ်" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black placeholder-slate-600 focus:outline-none focus:border-rose-500" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">ထပ်တိုးစျေးနှုန်း (MMK)</label>
                                <input type="number" name="price" placeholder="ဥပမာ - ၅၀၀" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-black placeholder-slate-600 focus:outline-none focus:border-rose-500" required />
                            </div>
                            <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md">
                                🚀 ပစ္စည်းအသစ် ထည့်မည်
                            </button>
                        </form>
                    </div>


                </div>

                {/* === 📋 ညာဘက်ခြမ်း: လက်ရှိ ရှိပြီးသား ဒေတာပြသမှု === */}
                <div className="lg:col-span-7 space-y-4">
                    <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                        📋 လက်ရှိ ရှိပြီးသား အပိုပစ္စည်းများနှင့် အုပ်စုများ
                    </h3>

                    {addonCategories.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                            ဒေတာများ မရှိသေးပါ။
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addonCategories.map(cat => (
                                <div key={cat.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-lg relative">

                                    {/* အုပ်စု Header + Actions တွဲဖက်ခြင်း */}
                                    <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3 gap-3">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="font-bold text-gray-800 text-sm truncate">{cat.name}</span>
                                            <span className="text-3xs bg-gray-50 text-gray-400 border border-gray-200 px-2 py-0.5 rounded font-mono shrink-0">
                                                {cat.minSelect}-{cat.maxSelect} ဦးစားပေး
                                            </span>
                                        </div>

                                        {/* 🎯 အုပ်စုလိုက် ပြင်/ဖျက် အက်ရှင်ခလုတ် */}
                                        <AddonCategoryActions cat={cat} />
                                    </div>

                                    {/* အပိုပစ္စည်းများ List */}
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {!cat.addons || cat.addons.length === 0 ? (
                                                <p className="text-3xs text-gray-300 italic col-span-2">ဤအုပ်စုအောက်တွင် ပစ္စည်းမရှိသေးပါ။</p>
                                            ) : (
                                                cat.addons.map((addon: any) => (
                                                    <div key={addon.id} className="flex justify-between items-center bg-gray-50/40 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all group">
                                                        <div className="flex items-center overflow-hidden">
                                                            <span className="text-xs font-medium text-gray-700 truncate">{addon.name}</span>

                                                            {/* 🎯 ပစ္စည်းတစ်ခုချင်းစီ ပြင်/ဖျက် အက်ရှင်ခလုတ် */}
                                                        </div>
                                                        <span className="text-3xs font-black text-gray-800 font-mono shrink-0">+{addon.price.toLocaleString()} MMK</span>
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