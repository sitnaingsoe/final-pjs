// app/(dashboard)/discounts/page.tsx
import React from 'react'
import { getDiscounts, createDiscount, toggleDiscountStatus } from '@/server/actions/discounts'

export default async function DiscountsPage() {
    const result = await getDiscounts()
    const discounts = result.data || []

    const handleToggle = async (id: string, currentStatus: boolean) => {
        'use server'
        await toggleDiscountStatus(id, currentStatus)
    }

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 glass ">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Promotions</h1>
                    </div>
                </div>
                <div className="px-5 py-3.5 bg-card rounded-2xl border border-border/50 flex items-center gap-4 shadow-sm shrink-0">
                    <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Promos</p>
                        <p className="text-xl font-black text-foreground leading-none mt-1">{discounts.filter(d => d.isActive).length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
 <div className="lg:col-span-4 glass p-6 lg:p-8 h-fit lg:sticky top-6 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-foreground">New Promotion</h2>
                    </div>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createDiscount(formData)
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Campaign Name <span className="text-foreground">*</span></label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Summer Sale 10%"
                                className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm focus:shadow-md"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Discount Type <span className="text-foreground">*</span></label>
                            <div className="relative">
                                <select
                                    name="type"
                                    className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm focus:shadow-md appearance-none"
                                    required
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Value <span className="text-foreground">*</span></label>
                            <input
                                type="number"
                                name="value"
                                placeholder="e.g. 10 or 1000"
                                className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground placeholder-slate-400 focus:outline-none focus:border-primary transition-all shadow-sm focus:shadow-md font-mono"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full mt-2 relative bg-black hover:bg-gray-900 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Start Promotion
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-8">
                    {discounts.length === 0 ? (
 <div className="glass p-16 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mb-5 border border-border/50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                            </div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">No Promotions</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Add from the form on the left</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            {discounts.map((disc) => (
                                <div key={disc.id} className={`group bg-card border ${disc.isActive ? 'border-border' : 'border-border/50 opacity-60 hover:opacity-100'} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start gap-2 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${disc.isActive ? 'bg-black text-white shadow-md shadow-black/10' : 'bg-gray-100 text-muted-foreground'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                                </div>
                                                <h4 className={`font-black text-sm uppercase tracking-wider leading-tight transition-colors ${disc.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {disc.name}
                                                </h4>
                                            </div>
                                            
                                            <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest shrink-0 ${disc.isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-muted/50 text-muted-foreground border border-border'}`}>
                                                {disc.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>

                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                            {disc.type === 'PERCENTAGE' ? 'Percentage Discount' : 'Fixed Discount'}
                                        </p>
                                        
                                        <div className="flex items-baseline gap-1 mt-3">
                                            <span className={`text-3xl font-black ${disc.isActive ? 'text-foreground' : 'text-muted-foreground'} tracking-tighter`}>
                                                {disc.type === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value.toLocaleString()}`}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                {disc.type === 'FIXED' ? 'MMK OFF' : 'OFF'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-3 relative z-10">
                                        <form action={handleToggle.bind(null, disc.id, disc.isActive)} className="flex-1">
                                            <button
                                                type="submit"
                                                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 group/btn ${disc.isActive
                                                        ? 'bg-card hover:bg-muted/50 text-foreground border-border shadow-sm hover:shadow-md'
                                                        : 'bg-black hover:bg-gray-900 text-white border-black shadow-md hover:shadow-lg'
                                                    }`}
                                            >
                                                {disc.isActive ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                                                        <span>Disable</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                                        <span>Activate</span>
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            const { deleteDiscount } = await import('@/server/actions/discounts')
                                            await deleteDiscount(disc.id)
                                        }}>
                                            <button
                                                type="submit"
                                                className="p-2.5 bg-card hover:bg-red-50 text-muted-foreground hover:text-red-600 border border-border hover:border-red-200 rounded-xl transition-all hover:shadow-sm"
                                                title="Delete Discount"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        </form>
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