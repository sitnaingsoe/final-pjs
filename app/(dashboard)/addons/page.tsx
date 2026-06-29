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
    // ဒေတာများ ဆွဲယူခြင်း
    const result = await getAddonCategories()
    const addonCategories = result.data || []

    const menuResult = await getMenuItemsSimple()
    const menuItems = menuResult.data || []

    return (
        <div className="space-y-6 p-2">
            <div>
                <h2 className="text-xl font-bold text-gray-800">အပိုထပ်ဆောင်း ပစ္စည်းများ စီမံခန့်ခွဲမှု (Addons)</h2>
                <p className="text-sm text-gray-500">"အသားတိုး"၊ "အချို/အစပ် ရွေးချယ်ရန်" စသည့် အပိုပစ္စည်းအုပ်စုများနှင့် ဟင်းပွဲများကို စိတ်ကြိုက် ချိတ်ဆက်ပါ</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === 🏢 ဘယ်ဘက်ခြမ်း: ဖောင်များ စုစည်းမှု (Forms) === */}
                <div className="space-y-6">

                    {/* ဖောင် (၁) - အပိုပစ္စည်းအုပ်စု ဆောက်ရန် */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-sm text-gray-700 mb-3">၁။ အပိုပစ္စည်းအုပ်စု ဆောက်ရန်</h3>
                        <form action={async (formData) => { 'use server'; await createAddonCategory(formData) }} className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">အုပ်စုအမည်</label>
                                <input type="text" name="name" placeholder="ဥပမာ - အသားတိုးရန်" className="w-full border p-2 text-sm rounded-lg" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">အနည်းဆုံး ရွေးရမည်</label>
                                    <input type="number" name="minSelect" defaultValue={0} className="w-full border p-2 text-sm rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">အများဆုံး ရွေးနိုင်မည်</label>
                                    <input type="number" name="maxSelect" defaultValue={1} className="w-full border p-2 text-sm rounded-lg" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition">
                                ➕ အုပ်စုဆောက်မည်
                            </button>
                        </form>
                    </div>

                    {/* ဖောင် (၂) - ပစ္စည်းအသေးစိတ်နှင့် စျေးနှုန်းထည့်ရန် */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-sm text-gray-700 mb-3">၂။ ပစ္စည်းအသေးစိတ်နှင့် စျေးနှုန်းထည့်ရန်</h3>
                        <form action={async (formData) => { 'use server'; await createAddon(formData) }} className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">ဘယ်အုပ်စုထဲ ထည့်မည်နည်း</label>
                                <select name="addonCategoryId" className="w-full border p-2 text-sm rounded-lg bg-white" required>
                                    <option value="">-- အုပ်စုရွေးချယ်ပါ --</option>
                                    {addonCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">ပစ္စည်းအမည်</label>
                                <input type="text" name="name" placeholder="ဥပမာ - ကြက်ဥပြုတ်" className="w-full border p-2 text-sm rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">ထပ်တိုးစျေးနှုန်း (MMK)</label>
                                <input type="number" name="price" placeholder="ဥပမာ - ၅၀၀" className="w-full border p-2 text-sm rounded-lg" required />
                            </div>
                            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg transition">
                                🚀 ပစ္စည်းအသစ် ထည့်မည်
                            </button>
                        </form>
                    </div>

                    {/* ဖောင် (၃) - ဟင်းပွဲနှင့် အပိုပစ္စည်းအုပ်စု ချိတ်ဆက်ရန် */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-sm text-gray-700 mb-3">၃။ ဟင်းပွဲနှင့် အပိုပစ္စည်းအုပ်စု ချိတ်ဆက်ရန်</h3>
                        <form action={async (formData) => { 'use server'; await linkMenuWithAddonCategory(formData) }} className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">မည်သည့် မီနူးဟင်းပွဲအတွက်လဲ</label>
                                <select name="menuItemId" className="w-full border p-2 text-sm rounded-lg bg-white" required>
                                    <option value="">-- ဟင်းပွဲရွေးချယ်ပါ --</option>
                                    {menuItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">မည်သည့် အပိုပစ္စည်းအုပ်စု ထည့်မည်လဲ</label>
                                <select name="addonCategoryId" className="w-full border p-2 text-sm rounded-lg bg-white" required>
                                    <option value="">-- အပိုပစ္စည်းအုပ်စု ရွေးချယ်ပါ --</option>
                                    {addonCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm">
                                🔗 မီနူးနှင့် အုပ်စု ချိတ်ဆက်မည်
                            </button>
                        </form>
                    </div>

                </div>

                {/* === 📋 ညာဘက်ခြမ်း: လက်ရှိ ရှိပြီးသား ဒေတာပြသမှု (Display) === */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        📋 လက်ရှိ ရှိပြီးသား အပိုပစ္စည်းများနှင့် အုပ်စုများ
                    </h3>

                    {addonCategories.length === 0 ? (
                        <div className="bg-white p-8 text-center text-gray-400 rounded-xl border">ဒေတာများ မရှိသေးပါ။</div>
                    ) : (
                        addonCategories.map(cat => (
                            <div key={cat.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">

                                {/* အုပ်စု Header */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 gap-2">
                                    <div>
                                        <span className="font-black text-slate-800 text-base flex items-center gap-2">
                                            📂 {cat.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                                            ရွေးချယ်မှု: {cat.minSelect} မှ {cat.maxSelect} ခုထိ
                                        </span>
                                    </div>
                                </div>

                           
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 mb-2">🔹 ပါဝင်သော အပိုပစ္စည်းများ</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {!cat.addons || cat.addons.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic col-span-2">ဤအုပ်စုအောက်တွင် ပစ္စည်းမရှိသေးပါ။</p>
                                        ) : (
                                            cat.addons.map((addon: any) => (
                                                <div key={addon.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition">
                                                    <span className="text-xs font-semibold text-gray-700">{addon.name}</span>
                                                    <span className="text-xs font-bold text-orange-600">+{addon.price.toLocaleString()} MMK</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}