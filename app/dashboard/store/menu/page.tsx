// app/dashboard/menu/page.tsx
import React from 'react'
import { getMenuItems, getAddonCategories } from '@/server/actions/menu'
import { getCategories } from '@/server/actions/categories'
import CreateMenuForm from '@/components/dashboard/CreateMenuForm'
import MenuCardActions from '@/components/dashboard/MenuCardActions'

export default async function MenuPage() {
    const [menuResult, catResult, addonResult] = await Promise.all([
        getMenuItems(),
        getCategories(),
        getAddonCategories()
    ])

    const menuItems = menuResult.data || []
    const categories = catResult.data || []
    const addonCategories = addonResult.data || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 uppercase tracking-wider">
                        စားစရာ မီနူးများ (Menu Items)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">ဟင်းပွဲများ၊ မုန့်များနှင့် ဖျော်ရည်များကို ဤနေရာတွင် ထည့်သွင်းနိုင်ပါသည်</p>
                </div>
                <div className="flex items-center gap-4">
                    <CreateMenuForm categories={categories} addonCategories={addonCategories} />
                    <div className="px-4 py-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md">
                        <span className="text-xl">🍔</span>
                        <div>
                            <p className="text-3xs text-slate-500 font-bold uppercase tracking-wider">Total Items</p>
                            <p className="text-sm font-black text-slate-200 font-mono">{menuItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">

                {/* (ခ) ရှိပြီးသား မီနူးများပြကတ်များ (Right Column => Full width now) */}
                <div>
                    {menuItems.length === 0 ? (
                        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center">
                            <span className="text-4xl mb-3 opacity-40">🍽️</span>
                            <h3 className="text-sm font-bold text-slate-400 uppercase">မီနူးများ မရှိသေးပါ</h3>
                            <p className="text-3xs text-slate-600 mt-1 uppercase">အထက်ပါခလုတ်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {menuItems.map((item: any) => (
                                <div key={item.id} className="group bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden">
                                    {item.imageUrl && (
                                        <div className="absolute top-0 left-0 w-full h-24 bg-slate-900 border-b border-slate-800 -mx-5 -mt-5 mb-5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={item.imageUrl ? "pt-20 relative z-10" : ""}>
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-bold text-slate-200 text-sm truncate group-hover:text-orange-400 transition-colors">
                                                {item.name}
                                            </h4>

                                            {/* 🎯 Edit & Delete Actions Dropdown/Box */}
                                            <MenuCardActions item={item} categories={categories} addonCategories={addonCategories} />
                                        </div>

                                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-3xs font-bold uppercase tracking-wider rounded">
                                            {item.category?.name || 'Uncategorized'}
                                        </span>

                                        {/* 🎯 ချိတ်ဆက်ထားသော Addons Badge လေးများ ပြသခြင်း */}
                                        {item.addonCategories?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.addonCategories.map((ac: any) => (
                                                    <span key={ac.addonCategoryId} className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded text-3xs border border-slate-800">
                                                        ➕ {ac.addonCategory?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                                            {item.description || <span className="italic opacity-30 text-3xs">ဖော်ပြချက် မရှိပါ</span>}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-end justify-between">
                                        <span className="text-3xs text-slate-500 font-bold uppercase tracking-wider">Price</span>
                                        <div className="text-sm font-black text-orange-400 font-mono">
                                            {item.price.toLocaleString()} <span className="text-3xs text-slate-500 font-normal">MMK</span>
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