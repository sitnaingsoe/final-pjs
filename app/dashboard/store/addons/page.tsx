/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/addons/page.tsx
import React from 'react'
import {
    getAddonCategories,
    createAddonCategory,
    createAddon,
    getMenuItemsSimple
} from '@/server/actions/addons'
import AddonCategoryActions from '@/components/dashboard/AddonCategoryActions'

export default async function AddonsPage() {
    const result = await getAddonCategories()
    const addonCategories = result.data || []

    const totalAddonsCount = addonCategories.reduce((acc: number, cat: any) => acc + (cat.addons?.length || 0), 0)

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Addon Modifiers</h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">Customizations</span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Manage sizes, toppings, ingredients, and extra options for your menu</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="px-5 py-3 bg-card/80 backdrop-blur-md rounded-2xl border border-border flex items-center gap-3.5 shadow-sm">
                        <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                        </div>
                        <div>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Groups</p>
                            <p className="text-lg font-bold text-foreground leading-none mt-0.5">{addonCategories.length}</p>
                        </div>
                    </div>
                    <div className="px-5 py-3 bg-card/80 backdrop-blur-md rounded-2xl border border-border flex items-center gap-3.5 shadow-sm">
                        <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                        </div>
                        <div>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total Items</p>
                            <p className="text-lg font-bold text-foreground leading-none mt-0.5">{totalAddonsCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column - Forms */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Step 1: Addon Category Form */}
                    <div className="glass rounded-3xl p-6 md:p-7">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/60">
                            <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-xs font-bold border border-orange-500/20">1</div>
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Create Addon Group</h2>
                                <p className="text-[11px] text-muted-foreground">e.g. Size, Toppings, Sugar Level</p>
                            </div>
                        </div>

                        <form
                            action={async (formData) => {
                                "use server"
                                await createAddonCategory(formData)
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-foreground">
                                    Group Name <span className="text-orange-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="e.g. Extra Meat, Size, Spice Level" 
                                    className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-foreground">Min Selection</label>
                                    <input 
                                        type="number" 
                                        name="minSelect" 
                                        defaultValue={0} 
                                        className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-foreground">Max Selection</label>
                                    <input 
                                        type="number" 
                                        name="maxSelect" 
                                        defaultValue={1} 
                                        className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 text-xs flex items-center justify-center gap-2 group/btn"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:rotate-90 transition-transform"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                Create Addon Group
                            </button>
                        </form>
                    </div>

                    {/* Step 2: Addon Item Form */}
                    <div className="glass rounded-3xl p-6 md:p-7">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/60">
                            <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-xs font-bold border border-orange-500/20">2</div>
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Add Option Item</h2>
                                <p className="text-[11px] text-muted-foreground">Add specific choices into a group</p>
                            </div>
                        </div>

                        <form
                            action={async (formData) => {
                                "use server"
                                await createAddon(formData)
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-foreground">
                                    Parent Group <span className="text-orange-500">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        name="addonCategoryId" 
                                        className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all shadow-sm" 
                                        required
                                    >
                                        <option value="">-- Select Addon Group --</option>
                                        {addonCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-foreground">
                                    Item Name <span className="text-orange-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="e.g. Boiled Egg, Extra Cheese, Large" 
                                    className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                    required 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-foreground">
                                    Extra Price (MMK) <span className="text-orange-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    placeholder="e.g. 500 (0 for free)" 
                                    className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 text-xs flex items-center justify-center gap-2 group/btn"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                                Add Option Item
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Data Display */}
                <div className="lg:col-span-7">
                    {addonCategories.length === 0 ? (
                        <div className="glass rounded-3xl p-16 text-center flex flex-col items-center justify-center h-80">
                            <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center text-muted-foreground/60 mb-4 border border-border">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1">No Addon Groups Configured</h3>
                            <p className="text-xs text-muted-foreground">Create your first group using the form on the left</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {addonCategories.map(cat => (
                                <div 
                                    key={cat.id} 
                                    className="glass hover-lift rounded-3xl p-5 md:p-6 border border-border/70 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between bg-card/60"
                                >
                                    <div>
                                        <div className="flex justify-between items-start border-b border-border/60 pb-3.5 mb-4 gap-3">
                                            <div className="flex flex-col gap-1.5 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                                                    </div>
                                                    <h3 className="font-bold text-foreground text-sm tracking-tight truncate">{cat.name}</h3>
                                                </div>
                                                <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold self-start">
                                                    Select: {cat.minSelect} to {cat.maxSelect}
                                                </span>
                                            </div>
                                            <AddonCategoryActions cat={cat} />
                                        </div>

                                        <div className="space-y-2">
                                            {!cat.addons || cat.addons.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-5 bg-card/40 rounded-2xl border border-dashed border-border/70 italic">No option items added yet</p>
                                            ) : (
                                                cat.addons.map((addon: any) => (
                                                    <div 
                                                        key={addon.id} 
                                                        className="flex justify-between items-center bg-card/70 hover:bg-card px-3.5 py-2.5 rounded-xl border border-border/60 hover:border-border transition-all"
                                                    >
                                                        <span className="text-xs font-medium text-foreground truncate pr-2">{addon.name}</span>
                                                        <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg shrink-0 font-mono">
                                                            +{addon.price.toLocaleString()} MMK
                                                        </span>
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