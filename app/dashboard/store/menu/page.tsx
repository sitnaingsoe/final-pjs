// app/dashboard/store/menu/page.tsx
import React from 'react'
import Image from 'next/image'
import { getMenuItems, getAddonCategories, getBranchMasterMenus } from '@/server/actions/menu'
import { getCategories } from '@/server/actions/categories'
import { getDiscounts } from '@/server/actions/discounts'
import CreateMenuForm from '@/components/dashboard/CreateMenuForm'
import MenuCardActions from '@/components/dashboard/MenuCardActions'
import ToggleMasterMenu from '@/components/dashboard/ToggleMasterMenu'
import ToggleLocalMenu from '@/components/dashboard/ToggleLocalMenu'
import AttachMasterMenuAddons from '@/components/dashboard/AttachMasterMenuAddons'

export default async function MenuPage() {
    const [menuResult, catResult, addonResult, discResult, masterMenuResult] = await Promise.all([
        getMenuItems(),
        getCategories(),
        getAddonCategories(),
        getDiscounts(),
        getBranchMasterMenus()
    ])

    const menuItems = menuResult.data || []
    const categories = catResult.data || []
    const addonCategories = addonResult.data || []
    const discounts = discResult.data?.filter(d => d.isActive) || [] // Only active discounts
    const masterMenus = masterMenuResult.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm relative z-50">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Menu Items</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your menu offerings, prices, and availability</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 shrink-0">
                    <CreateMenuForm categories={categories} addonCategories={addonCategories} discounts={discounts} />
                    <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3 shadow-sm min-w-[130px] justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Items</p>
                            <p className="text-base font-bold text-slate-800 font-mono leading-none">{menuItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                {/* (ခ) ရှိပြီးသား မီနူးများပြကတ်များ (Right Column => Full width now) */}
                <div>
                    {menuItems.length === 0 ? (
                        <div className="glass rounded-[2rem] border border-border/50 p-12 text-center flex flex-col items-center justify-center shadow-2xl">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mb-4 border border-dashed border-border">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                            </div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">No Menu Items Found</h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase">အထက်ပါခလုတ်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {menuItems.map((item: any) => (
                                <div key={item.id} className={`group bg-white border ${item.masterMenuId ? 'border-orange-200 shadow-sm' : 'border-slate-200/80 shadow-sm'} rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5`}>
                                    
                                    {/* Master Menu Badge */}
                                    {item.masterMenuId && (
                                        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-20 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                                            Main Menu
                                        </div>
                                    )}

                                    {/* Unavailable Badge */}
                                    {!item.isActive && (
                                        <div className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-20 shadow-sm uppercase tracking-wider">
                                            UNAVAILABLE
                                        </div>
                                    )}

                                    {/* 🖼️ Hero Image */}
                                    {item.imageUrl && item.imageUrl.trim() !== '' && item.imageUrl !== 'null' && item.imageUrl !== 'undefined' ? (
                                        <div className="w-full h-44 bg-slate-100 border-b border-slate-100 relative overflow-hidden rounded-t-2xl">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 25vw" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-44 bg-slate-100 border-b border-slate-100 flex items-center justify-center relative overflow-hidden rounded-t-2xl">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative z-10 bg-white">
                                        <div>
                                            <div className="flex justify-between items-start gap-3">
                                                <h4 className="font-semibold text-slate-800 text-base leading-snug line-clamp-2">
                                                    {item.name}
                                                </h4>

                                                {/* 🎯 Edit & Delete Actions Dropdown/Box */}
                                                {!item.masterMenuId ? (
                                                    <MenuCardActions item={item} categories={categories} addonCategories={addonCategories} discounts={discounts} />
                                                ) : (
                                                    <div className="bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-500 flex items-center gap-1 shadow-sm uppercase tracking-wider shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                        HQ
                                                    </div>
                                                )}
                                            </div>

                                            {item.discount && (
                                                <span className="inline-block mt-2.5 px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[11px] font-semibold uppercase tracking-wider rounded-full border border-rose-100">
                                                    {item.discount.type === 'PERCENTAGE' 
                                                        ? `${item.discount.value}% OFF` 
                                                        : `${item.discount.value} MMK OFF`}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Base Price</span>
                                                <div className="text-base font-bold text-slate-900 font-mono tracking-tight">
                                                    {item.price.toLocaleString()} <span className="text-xs text-slate-400 font-medium ml-0.5 uppercase">MMK</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                                <ToggleLocalMenu itemId={item.id} initialIsActive={item.isActive} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* (ဂ) ဗဟိုမှ ဖြန့်ဝေထားသော Master Menus များ */}
                {masterMenus.length > 0 && (
                    <div className="mt-12 bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-8 shadow-sm">
                        <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
                            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                                    Main Menu
                                </h3>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">ဗဟိုရုံးချုပ်မှ သတ်မှတ်ထားသော စံနှုန်းဟင်းပွဲများ</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {masterMenus.map((mb: any) => (
                                <div key={mb.menuId} className="group bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5">
                                    {/* Master Menu Badge */}
                                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-20 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                                        Main Menu
                                    </div>
                                    {!mb.isAvailable && (
                                        <div className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-20 shadow-sm uppercase tracking-wider">
                                            UNAVAILABLE
                                        </div>
                                    )}

                                    {/* 🖼️ Hero Image */}
                                    {mb.menu.image && mb.menu.image.trim() !== '' && mb.menu.image !== 'null' && mb.menu.image !== 'undefined' ? (
                                        <div className="w-full h-44 bg-slate-100 border-b border-slate-100 relative overflow-hidden rounded-t-2xl">
                                            <Image src={mb.menu.image} alt={mb.menu.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 25vw" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-44 bg-slate-100 border-b border-slate-100 flex items-center justify-center relative overflow-hidden rounded-t-2xl">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative z-10 bg-white">
                                        <div>
                                            <h4 className="font-semibold text-slate-800 text-base leading-snug line-clamp-2">
                                                {mb.menu.name}
                                            </h4>

                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Base Price</span>
                                                <div className="text-base font-bold text-slate-900 font-mono tracking-tight">
                                                    {mb.menu.basePrice.toLocaleString()} <span className="text-xs text-slate-400 font-medium ml-0.5 uppercase">MMK</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                                <ToggleMasterMenu menuId={mb.menuId} initialIsAvailable={mb.isAvailable} />
                                                <AttachMasterMenuAddons 
                                                    menuId={mb.menuId} 
                                                    menuName={mb.menu.name} 
                                                    currentAddonCategories={mb.menu.addonCategories || []} 
                                                    allAddonCategories={addonCategories} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}