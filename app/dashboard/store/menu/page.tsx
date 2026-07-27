// app/dashboard/store/menu/page.tsx
import React from 'react'
import Image from 'next/image'
import { getMenuItems, getAddonCategories, getBranchMasterMenus } from '@/server/actions/menu'
import { getCategories } from '@/server/actions/categories'
import { getDiscounts } from '@/server/actions/discounts'
import CreateMenuForm from '@/components/dashboard/CreateMenuForm'
import MenuCardActions from '@/components/dashboard/MenuCardActions'
import ToggleMasterMenu from '@/components/dashboard/ToggleMasterMenu'
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-50">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Menu Items</h1>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">ဟင်းပွဲများ၊ မုန့်များနှင့် ဖျော်ရည်များကို ဤနေရာတွင် ထည့်သွင်းနိုင်ပါသည်</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 shrink-0">
                    <CreateMenuForm categories={categories} addonCategories={addonCategories} discounts={discounts} />
                    <div className="px-5 py-3 bg-white border border-gray-100 rounded-[1.5rem] flex items-center gap-3 shadow-sm min-w-[140px] justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Items</p>
                            <p className="text-lg font-black text-black font-mono leading-none">{menuItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                {/* (ခ) ရှိပြီးသား မီနူးများပြကတ်များ (Right Column => Full width now) */}
                <div>
                    {menuItems.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 p-12 text-center flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Menu Items Found</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase">အထက်ပါခလုတ်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {menuItems.map((item: any) => (
                                <div key={item.id} className={`group bg-white/80 backdrop-blur-xl border ${item.masterMenuId ? 'border-black/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)]' : 'border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} rounded-[2rem] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1`}>
                                    
                                    {/* Master Menu Badge */}
                                    {item.masterMenuId && (
                                        <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl z-20 shadow-lg uppercase tracking-widest flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                                            Main Menu
                                        </div>
                                    )}

                                    {/* 🖼️ Hero Image */}
                                    {item.imageUrl && item.imageUrl.trim() !== '' && item.imageUrl !== 'null' && item.imageUrl !== 'undefined' ? (
                                        <div className="w-full h-36 bg-gray-50 border-b border-gray-100 relative overflow-hidden">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" sizes="(max-width: 768px) 100vw, 25vw" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 transition-opacity duration-300 group-hover:opacity-60"></div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-36 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-200/50 to-transparent"></div>
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative z-10 bg-white">
                                        <div>
                                            <div className="flex justify-between items-start gap-3">
                                                <h4 className="font-black text-black text-lg leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors">
                                                    {item.name}
                                                </h4>

                                                {/* 🎯 Edit & Delete Actions Dropdown/Box */}
                                                {!item.masterMenuId ? (
                                                    <MenuCardActions item={item} categories={categories} addonCategories={addonCategories} discounts={discounts} />
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-gray-500 flex items-center gap-1.5 shadow-sm uppercase tracking-widest shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                        HQ
                                                    </div>
                                                )}
                                            </div>

                                            {item.discount && (
                                                <span className="inline-block mt-3 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-200">
                                                    {item.discount.type === 'PERCENTAGE' 
                                                        ? `${item.discount.value}% OFF` 
                                                        : `${item.discount.value} MMK OFF`}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Price</span>
                                            <div className="text-lg font-black text-black font-mono tracking-tight">
                                                {item.price.toLocaleString()} <span className="text-[9px] text-gray-400 font-bold ml-0.5 tracking-widest uppercase">MMK</span>
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
                    <div className="mt-12 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-black uppercase tracking-tight">
                                    Main Menu
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ဗဟိုရုံးချုပ်မှ သတ်မှတ်ထားသော စံနှုန်းဟင်းပွဲများ</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {masterMenus.map((mb: any) => (
                                <div key={mb.menuId} className="group bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2rem] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:border-black/30 hover:-translate-y-1">
                                    {/* Master Menu Badge */}
                                    <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl z-20 shadow-lg uppercase tracking-widest flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                                        Main Menu
                                    </div>
                                    {!mb.isAvailable && (
                                        <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl z-20 shadow-lg uppercase tracking-widest">
                                            UNAVAILABLE
                                        </div>
                                    )}

                                    {/* 🖼️ Hero Image */}
                                    {mb.menu.image && mb.menu.image.trim() !== '' && mb.menu.image !== 'null' && mb.menu.image !== 'undefined' ? (
                                        <div className="w-full h-36 bg-gray-50 border-b border-gray-100 relative overflow-hidden">
                                            <Image src={mb.menu.image} alt={mb.menu.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" sizes="(max-width: 768px) 100vw, 25vw" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 transition-opacity duration-300 group-hover:opacity-60"></div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-36 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-200/50 to-transparent"></div>
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative z-10 bg-white">
                                        <div>
                                            <h4 className="font-black text-black text-lg leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors">
                                                {mb.menu.name}
                                            </h4>

                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex gap-2 items-center">
                                                <ToggleMasterMenu menuId={mb.menuId} initialIsAvailable={mb.isAvailable} />
                                                <AttachMasterMenuAddons 
                                                    menuId={mb.menuId} 
                                                    menuName={mb.menu.name} 
                                                    currentAddonCategories={mb.menu.addonCategories || []} 
                                                    allAddonCategories={addonCategories} 
                                                />
                                            </div>
                                            <div className="text-lg font-black text-black font-mono tracking-tight">
                                                {mb.menu.basePrice.toLocaleString()} <span className="text-[9px] text-gray-400 font-bold ml-0.5 tracking-widest uppercase">MMK</span>
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