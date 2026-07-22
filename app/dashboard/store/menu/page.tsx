// app/dashboard/menu/page.tsx
import React from 'react'
import Image from 'next/image'
import { getMenuItems, getAddonCategories } from '@/server/actions/menu'
import { getCategories } from '@/server/actions/categories'
import { getDiscounts } from '@/server/actions/discounts'
import CreateMenuForm from '@/components/dashboard/CreateMenuForm'
import MenuCardActions from '@/components/dashboard/MenuCardActions'

export default async function MenuPage() {
    const [menuResult, catResult, addonResult, discResult] = await Promise.all([
        getMenuItems(),
        getCategories(),
        getAddonCategories(),
        getDiscounts()
    ])

    const menuItems = menuResult.data || []
    const categories = catResult.data || []
    const addonCategories = addonResult.data || []
    const discounts = discResult.data?.filter(d => d.isActive) || [] // Only active discounts

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 uppercase tracking-wider">
                        စားစရာ မီနူးများ (Menu Items)
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">ဟင်းပွဲများ၊ မုန့်များနှင့် ဖျော်ရည်များကို ဤနေရာတွင် ထည့်သွင်းနိုင်ပါသည်</p>
                </div>
                <div className="flex items-center gap-4">
                    <CreateMenuForm categories={categories} addonCategories={addonCategories} discounts={discounts} />
                    <div className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-md">
                        <span className="text-xl">🍔</span>
                        <div>
                            <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Total Items</p>
                            <p className="text-sm font-black text-gray-800 font-mono">{menuItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">

                {/* (ခ) ရှိပြီးသား မီနူးများပြကတ်များ (Right Column => Full width now) */}
                <div>
                    {menuItems.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                            <span className="text-4xl mb-3 opacity-40">🍽️</span>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">မီနူးများ မရှိသေးပါ</h3>
                            <p className="text-3xs text-gray-300 mt-1 uppercase">အထက်ပါခလုတ်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {menuItems.map((item: any) => (
                                <div key={item.id} className={`group bg-white border ${item.masterMenuId ? 'border-black/30' : 'border-gray-200'} rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 hover:border-black/50 hover:shadow-black/10 hover:shadow-2xl`}>
                                    
                                    {/* Master Menu Badge */}
                                    {item.masterMenuId && (
                                        <div className="absolute top-2 left-2 bg-black text-white text-3xs font-bold px-2 py-1 rounded z-20 shadow-md">
                                            MASTER MENU
                                        </div>
                                    )}

                                    {/* 🖼️ Hero Image */}
                                    {item.imageUrl ? (
                                        <div className="w-full h-40 bg-gray-50 border-b border-gray-200 relative">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-80"></div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 bg-gray-50 border-b border-gray-200 flex items-center justify-center relative">
                                            <span className="text-gray-200 text-3xl">🍽️</span>
                                            <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-80"></div>
                                        </div>
                                    )}

                                    <div className="p-5 flex-1 flex flex-col justify-between -mt-12 relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-black text-gray-900 text-lg line-clamp-1 group-hover:text-gray-800 transition-colors drop-shadow-md">
                                                    {item.name}
                                                </h4>

                                                {/* 🎯 Edit & Delete Actions Dropdown/Box */}
                                                {!item.masterMenuId ? (
                                                    <MenuCardActions item={item} categories={categories} addonCategories={addonCategories} discounts={discounts} />
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-300 px-2 py-1 rounded-lg text-3xs font-bold text-gray-500 flex items-center gap-1 shadow-inner">
                                                        <span>🔒</span> HQ
                                                    </div>
                                                )}
                                            </div>

                                            <span className="inline-block mt-2 px-2 py-0.5 bg-black/10 border border-black/20 text-gray-800 text-3xs font-bold uppercase tracking-wider rounded">
                                                {item.category?.name || 'Uncategorized'}
                                            </span>

                                            {/* 🎯 ချိတ်ဆက်ထားသော Addons Badge လေးများ ပြသခြင်း */}
                                            {item.addonCategories?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {item.addonCategories.map((ac: any) => (
                                                        <span key={ac.addonCategoryId} className="bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded text-3xs border border-gray-200">
                                                            ➕ {ac.addonCategory?.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                                                {item.description || <span className="italic opacity-30 text-3xs">ဖော်ပြချက် မရှိပါ</span>}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-end justify-between">
                                            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Price</span>
                                            <div className="text-base font-black text-gray-800 font-mono">
                                                {item.price.toLocaleString()} <span className="text-3xs text-gray-400 font-normal">MMK</span>
                                            </div>
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