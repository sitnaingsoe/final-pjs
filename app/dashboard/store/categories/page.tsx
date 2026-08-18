// app/dashboard/categories/page.tsx
import React from 'react'
import { getCategories, createCategory } from '@/server/actions/categories'
import CategoryCardActions from '@/components/dashboard/CategoryCardActions'

export default async function CategoriesPage() {
    const result = await getCategories()
    const categories = result.data || []

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-7xl mx-auto">
            {/* Page Header Area */}
            <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Menu Categories</h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">Store Setup</span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Organize and structure your menu offerings for staff and customers</p>
                    </div>
                </div>

                <div className="px-5 py-3 bg-card/80 backdrop-blur-md rounded-2xl border border-border flex items-center gap-4 shadow-sm shrink-0 self-start md:self-auto relative z-10">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total Categories</p>
                        <p className="text-xl font-bold text-foreground leading-none mt-1">{categories.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Create Form */}
                <div className="lg:col-span-4 glass rounded-3xl p-6 md:p-7 sticky top-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground">Add New Category</h2>
                            <p className="text-[11px] text-muted-foreground">Create a fresh grouping</p>
                        </div>
                    </div>

                    <form
                        action={createCategory}
                        className="space-y-4"
                    >
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                                Category Name <span className="text-orange-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Hot Beverages, Desserts"
                                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">Description</label>
                            <textarea
                                name="description"
                                placeholder="Short description of this category..."
                                className="w-full bg-card border border-border rounded-xl p-3.5 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-24 resize-none"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 text-xs flex items-center justify-center gap-2 group/btn"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:rotate-90 transition-transform"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            Create Category
                        </button>
                    </form>
                </div>

                {/* Right Column: Categories Grid */}
                <div className="lg:col-span-8">
                    {categories.length === 0 ? (
                        <div className="glass rounded-3xl p-16 text-center flex flex-col items-center justify-center h-72">
                            <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center text-muted-foreground/60 mb-4 border border-border">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1">No Categories Found</h3>
                            <p className="text-xs text-muted-foreground">Add your first category using the form on the left</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {categories.map((cat: any) => (
                                <div 
                                    key={cat.id} 
                                    className="group glass hover-lift rounded-3xl p-5 md:p-6 border border-border/70 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between relative bg-card/60"
                                >
                                    <div>
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0 border border-orange-500/10 group-hover:scale-105 transition-transform">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h4 className="font-bold text-foreground text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                                                        {cat.name}
                                                    </h4>
                                                    <p className="text-[11px] text-muted-foreground">Category</p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <CategoryCardActions cat={cat} />
                                        </div>

                                        <p className="text-xs text-muted-foreground mt-2 font-normal leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                            {cat.description || <span className="italic opacity-50 text-[11px]">No description provided</span>}
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between">
                                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                            Linked Items
                                        </span>
                                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-primary/20">
                                            {cat._count?.menuItems || 0} {cat._count?.menuItems === 1 ? 'item' : 'items'}
                                        </span>
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