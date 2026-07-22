import React, { useState, useEffect } from 'react'

interface AddonSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItem: any;
    onAddToCart: (menuItem: any, selectedAddons: any[]) => void;
}

export default function AddonSelectionModal({ isOpen, onClose, menuItem, onAddToCart }: AddonSelectionModalProps) {
    const [selectedAddons, setSelectedAddons] = useState<Record<string, any[]>>({})

    // Reset selection when menu item changes
    useEffect(() => {
        if (isOpen && menuItem) {
            setSelectedAddons({})
        }
    }, [isOpen, menuItem])

    if (!isOpen || !menuItem) return null;

    const addonCategories = menuItem.addonCategories?.map((ac: any) => ac.addonCategory) || []

    const handleAddonChange = (category: any, addon: any, isChecked: boolean) => {
        setSelectedAddons(prev => {
            const currentSelected = prev[category.id] || []
            let newSelected = [...currentSelected]

            if (isChecked) {
                // Check maxSelect
                if (category.maxSelect && currentSelected.length >= category.maxSelect) {
                    // If maxSelect is 1, we can auto-switch like a radio button
                    if (category.maxSelect === 1) {
                        newSelected = [addon]
                    } else {
                        // Otherwise ignore check
                        return prev;
                    }
                } else {
                    newSelected.push(addon)
                }
            } else {
                newSelected = newSelected.filter(a => a.id !== addon.id)
            }

            return { ...prev, [category.id]: newSelected }
        })
    }

    // Validate minSelect
    const isValid = addonCategories.every((cat: any) => {
        if (cat.isRequired || (cat.minSelect && cat.minSelect > 0)) {
            const selectedCount = (selectedAddons[cat.id] || []).length;
            return selectedCount >= (cat.minSelect || 1);
        }
        return true;
    })

    const calculateTotalPrice = () => {
        let total = menuItem.price;
        Object.values(selectedAddons).forEach(addonsArray => {
            addonsArray.forEach(a => {
                total += a.price;
            })
        })
        return total;
    }

    const handleAdd = () => {
        if (!isValid) return;
        const flatSelectedAddons = Object.values(selectedAddons).flat().map(a => ({
            addonId: a.id,
            name: a.name,
            price: a.price
        }))
        onAddToCart(menuItem, flatSelectedAddons)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-gray-900">{menuItem.name}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-slate-700 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Body - Addon Categories */}
                <div className="p-5 overflow-y-auto max-h-[75vh] md:max-h-[60vh] space-y-6">
                    {addonCategories.map((cat: any) => {
                        const isRequired = cat.isRequired || (cat.minSelect && cat.minSelect > 0);
                        const selectedCount = (selectedAddons[cat.id] || []).length;
                        const hasError = isRequired && selectedCount < (cat.minSelect || 1);

                        return (
                            <div key={cat.id} className="space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        {cat.name}
                                        {isRequired && <span className="text-3xs bg-black/20 text-gray-800 px-2 py-0.5 rounded uppercase">Required</span>}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        {cat.maxSelect === 1 ? 'Choose 1' : 
                                         cat.maxSelect ? `Choose up to ${cat.maxSelect}` : 'Choose multiple'}
                                    </span>
                                </div>
                                
                                <div className="space-y-2">
                                    {cat.addons?.map((addon: any) => {
                                        const isChecked = (selectedAddons[cat.id] || []).some(a => a.id === addon.id);
                                        // For radio style, maxSelect === 1
                                        const isRadio = cat.maxSelect === 1;

                                        return (
                                            <label key={addon.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'bg-black/10 border-black/50' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 flex items-center justify-center border ${isRadio ? 'rounded-full' : 'rounded'} ${isChecked ? 'bg-black border-black' : 'bg-gray-50 border-slate-600'}`}>
                                                        {isChecked && !isRadio && <span className="text-black text-xs">✓</span>}
                                                        {isChecked && isRadio && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">{addon.name}</span>
                                                </div>
                                                {addon.price > 0 ? (
                                                    <span className="text-xs font-mono text-gray-500">+{addon.price.toLocaleString()} MMK</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Free</span>
                                                )}
                                                <input 
                                                    type={isRadio ? "radio" : "checkbox"} 
                                                    className="hidden"
                                                    checked={isChecked}
                                                    onChange={(e) => handleAddonChange(cat, addon, e.target.checked)}
                                                />
                                            </label>
                                        )
                                    })}
                                </div>
                                {hasError && (
                                    <p className="text-xs text-red-600 mt-1">
                                        Please select at least {cat.minSelect || 1} option(s).
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 bg-white shrink-0">
                    <button 
                        onClick={handleAdd}
                        disabled={!isValid}
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-gray-800 hover:to-gray-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-gray-400 text-black font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-between px-6"
                    >
                        <span>Add to Cart</span>
                        <span className="font-mono text-lg">{calculateTotalPrice().toLocaleString()} MMK</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
