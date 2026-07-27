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
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Addon Management</h1>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">အပိုထပ်ဆောင်းပစ္စည်းများကို စီမံရန်</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column - Forms */}
                <div className="lg:col-span-5 space-y-6 lg:space-y-8">
                    
                    {/* Addon Category Form */}
                    <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-gray-200/50">
                            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-xs font-black text-white shadow-md shadow-black/10">1</div>
                            <h2 className="text-sm font-black uppercase tracking-wider text-black">Create Category <span className="font-bold text-gray-400 tracking-normal ml-1 text-[10px]">(အုပ်စုအသစ်)</span></h2>
                        </div>
                        <form
                            action={async (formData) => {
                                'use server';
                                await createAddonCategory(formData);
                            }}
                            className="space-y-5"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Category Name <span className="text-black">*</span></label>
                                <input type="text" name="name" placeholder="e.g. Extra Meat" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Min Select</label>
                                    <input type="number" name="minSelect" defaultValue={0} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md font-mono" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Max Select</label>
                                    <input type="number" name="maxSelect" defaultValue={1} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md font-mono" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-2 bg-white border border-gray-200 hover:border-black hover:shadow-md text-black font-black py-3 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 group/btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                Create Category
                            </button>
                        </form>
                    </div>

                    {/* Addon Item Form */}
                    <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-gray-200/50">
                            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-xs font-black text-white shadow-md shadow-black/10">2</div>
                            <h2 className="text-sm font-black uppercase tracking-wider text-black">Add Item <span className="font-bold text-gray-400 tracking-normal ml-1 text-[10px]">(ပစ္စည်းအသစ်)</span></h2>
                        </div>
                        <form
                            action={async (formData) => {
                                'use server';
                                await createAddon(formData);
                            }}
                            className="space-y-5"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Category <span className="text-black">*</span></label>
                                <div className="relative">
                                    <select name="addonCategoryId" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black focus:outline-none focus:border-black appearance-none transition-all shadow-sm focus:shadow-md" required>
                                        <option value="">-- Choose Category --</option>
                                        {addonCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Addon Name <span className="text-black">*</span></label>
                                <input type="text" name="name" placeholder="e.g. Boiled Egg" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Price (MMK) <span className="text-black">*</span></label>
                                <input type="number" name="price" placeholder="e.g. 500" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md font-mono" required />
                            </div>
                            <button type="submit" className="w-full mt-2 relative bg-black hover:bg-gray-900 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                Add Item
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Data Display */}
                <div className="lg:col-span-7">
                    <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
                        <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-gray-200/50">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <h2 className="text-base font-black uppercase tracking-wider text-black">Current Addons <span className="font-bold text-gray-400 tracking-normal ml-1 text-sm">(စာရင်း)</span></h2>
                        </div>

                        {addonCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Addons Yet</h3>
                                <p className="text-xs text-gray-500 font-bold">အပိုပစ္စည်းများ မရှိသေးပါ။</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addonCategories.map(cat => (
                                    <div key={cat.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4 gap-3">
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <span className="font-black text-black text-sm uppercase tracking-wider truncate">{cat.name}</span>
                                                <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-md font-black uppercase tracking-widest self-start">
                                                    Select: {cat.minSelect}-{cat.maxSelect}
                                                </span>
                                            </div>
                                            <AddonCategoryActions cat={cat} />
                                        </div>

                                        <div className="space-y-2">
                                            {!cat.addons || cat.addons.length === 0 ? (
                                                <p className="text-xs font-bold text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">No items in this category</p>
                                            ) : (
                                                cat.addons.map((addon: any) => (
                                                    <div key={addon.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <span className="text-xs font-bold text-gray-800 truncate pr-2">{addon.name}</span>
                                                        <span className="text-[10px] font-black text-black bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 shrink-0">+{addon.price.toLocaleString()}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}