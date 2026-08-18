'use client'

import React, { useState, useTransition } from 'react'
import { updateMasterMenuAddons } from '@/server/actions/addons'

interface AttachMasterMenuAddonsProps {
    menuId: string
    menuName: string
    currentAddonCategories: any[]
    allAddonCategories: any[]
}

export default function AttachMasterMenuAddons({
    menuId,
    menuName,
    currentAddonCategories,
    allAddonCategories
}: AttachMasterMenuAddonsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [selectedAddons, setSelectedAddons] = useState<string[]>(
        currentAddonCategories.map(c => c.id)
    )

    const handleToggle = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        )
    }

    const handleSave = () => {
        startTransition(async () => {
            setError(null)
            const res = await updateMasterMenuAddons(menuId, selectedAddons)
            if (res.success) {
                setIsOpen(false)
            } else {
                setError(res.error || 'Failed to update addons')
            }
        })
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-muted/50 border border-border hover:bg-gray-100 hover:border-gray-300 text-foreground px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Addons ({currentAddonCategories?.length || 0})
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsOpen(false)}></div>
                    <div className="bg-card rounded-[2rem] w-full max-w-md relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-border/50 p-6 flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight line-clamp-1">{menuName}</h3>
                                    <p className="text-3xs text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">Attach Addons to Main Menu</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-[10px] p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-widest">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Addon Categories</label>
                                
                                {allAddonCategories.length === 0 ? (
                                    <div className="text-center py-6 bg-muted/50 border border-dashed border-border rounded-xl">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Addon Categories Found</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">Please create them in the Addons tab first.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar p-1">
                                        {allAddonCategories.map((cat: any) => {
                                            const isSelected = selectedAddons.includes(cat.id);
                                            return (
                                                <label 
                                                    key={cat.id} 
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                                        isSelected 
                                                            ? 'border-black bg-black/5 shadow-sm' 
                                                            : 'border-border bg-card hover:border-gray-300'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => handleToggle(cat.id)}
                                                        disabled={isPending}
                                                        className="w-4 h-4 text-foreground border-gray-300 rounded focus:ring-black accent-black shrink-0" 
                                                    />
                                                    <span className="text-xs font-bold text-foreground truncate">
                                                        {cat.name}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-6 border-t border-border/50 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsOpen(false)} 
                                        disabled={isPending}
                                        className="bg-card border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground px-5 py-2.5 rounded-xl text-[10px] font-black transition-colors uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isPending} 
                                        className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                                    >
                                        {isPending ? (
                                            <>
                                                <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Saving...</span>
                                            </>
                                        ) : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
