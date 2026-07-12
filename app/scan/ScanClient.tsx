// app/scan/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getMenuForTable, placeTableOrder } from '@/server/actions/tables'

export default function AdvancedCustomerScanPage() {
    const searchParams = useSearchParams()
    const tableNumber = searchParams.get('tableNumber') || 'Unknown'

    const [menuItems, setMenuItems] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

    const [cart, setCart] = useState<any[]>([])
    const [notes, setNotes] = useState('')
    const [isOrdered, setIsOrdered] = useState(false)
    const [loading, setLoading] = useState(true)

    const [activeItem, setActiveItem] = useState<any | null>(null)
    const [selectedAddons, setSelectedAddons] = useState<any[]>([])

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        async function loadData() {
            try {
                const res = await getMenuForTable(tableNumber)
                if (res && res.success) {
                    setMenuItems(res.menuItems || [])
                    setCategories(res.categories || [])
                }
            } catch (err) {
                console.error("Data loading error:", err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [tableNumber])

    // 🔑 ကာကွယ်ရေးစနစ်ပါဝင်သော ဖြန့်ချရယူသည့် ဖန်ရှင်
    const handleItemClick = (item: any) => {
        if (!item) return

        const allAddons = item.addonCategories?.flatMap(
            (bridge: any) => bridge?.addonCategory?.addons || []
        ) || []

        if (allAddons.length > 0) {
            setActiveItem({ ...item, flattenAddons: allAddons })
            setSelectedAddons([])
        } else {
            addToCartDirect(item, [])
        }
    }

    const toggleAddon = (addon: any) => {
        if (!addon) return
        setSelectedAddons(prev =>
            prev.find(a => a.id === addon.id)
                ? prev.filter(a => a.id !== addon.id)
                : [...prev, addon]
        )
    }

    const confirmAddonToCart = () => {
        if (!activeItem) return
        addToCartDirect(activeItem, selectedAddons)
        setActiveItem(null)
    }

    const addToCartDirect = (item: any, addons: any[]) => {
        if (!item) return
        const addonIds = addons.map(a => a.id).sort().join(',')
        const cartId = `${item.id}-${addonIds}`

        setCart(prev => {
            const existingIndex = prev.findIndex(c => c.cartId === cartId)
            if (existingIndex > -1) {
                const updated = [...prev]
                updated[existingIndex].quantity += 1
                return updated
            } else {
                return [...prev, { cartId, menuItem: item, quantity: 1, selectedAddons: addons }]
            }
        })
    }

    const updateCartQuantity = (cartId: string, delta: number) => {
        setCart(prev =>
            prev.map(c => {
                if (c.cartId === cartId) {
                    const nextQty = c.quantity + delta
                    return nextQty <= 0 ? null : { ...c, quantity: nextQty }
                }
                return c
            }).filter(Boolean) as any[]
        )
    }

    const totalAmount = cart.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((s: number, a: any) => s + (a?.price || 0), 0) || 0
        return sum + (((item.menuItem?.price || 0) + addonsTotal) * item.quantity)
    }, 0)

    // 🛡️ Safe Array Filtering
    const safeMenuItems = Array.isArray(menuItems) ? menuItems : []
    const filteredMenuItems = selectedCategory === 'ALL'
        ? safeMenuItems
        : safeMenuItems.filter(item => item && item.categoryId === selectedCategory)

    const handleOrderSubmit = async () => {
        if (cart.length === 0) return
        const orderItems = cart.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
        }))

        const res = await placeTableOrder(tableNumber, orderItems, notes)
        if (res.success) {
            setIsOrdered(true)
            setCart([])
        } else {
            alert(res.error)
        }
    }

    if (!mounted) return null
    if (loading) return <div className="h-screen flex items-center justify-center text-sm font-medium">မီနူးများ တင်နေပါသည်...</div>

    if (isOrdered) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-green-50">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-green-800">အော်ဒါ မီးဖိုချောင်သို့ ရောက်သွားပါပြီ။</h2>
                <p className="text-sm text-green-600 mt-2">စားပွဲနံပါတ် [ {tableNumber} ] အတွက် ဟင်းပွဲများကို ပြင်ဆင်နေပါပြီ။</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-40 relative">

            {/* Header & Categories */}
            <header className="bg-slate-900 text-white p-5 sticky top-0 shadow-md z-40 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-lg font-bold tracking-wide text-orange-500">မြန်မာ့ရသာ</h1>
                        <p className="text-xs text-gray-400">QR Mobile Ordering</p>
                    </div>
                    <div className="bg-orange-500 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow">
                        🍽️ စားပွဲ - {tableNumber}
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto py-1">
                    <button
                        onClick={() => setSelectedCategory('ALL')}
                        className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === 'ALL' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-gray-300'
                            }`}
                    >
                        အားလုံး
                    </button>
                    {(Array.isArray(categories) ? categories : []).map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-gray-300'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </header>

            {/* 🍽️ မီနူးဟင်းပွဲစာရင်း */}
            <div className="p-4 space-y-4">
                {filteredMenuItems.map(item => {
                    if (!item) return null
                    return (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center gap-2">
                            <div className="space-y-1 flex-1">
                                <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                                <div className="text-xs text-gray-400 line-clamp-2">{item.description || '-'}</div>
                                <div className="text-sm font-black text-orange-600 mt-1">{(item.price || 0).toLocaleString()} MMK</div>

                                {item.addonCategories && item.addonCategories.length > 0 && (
                                    <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium mt-1">
                                        ➕ စိတ်ကြိုက်ပြင်ဆင်ရန် ရှိသည်
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => handleItemClick(item)}
                                className="text-xs font-bold px-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition whitespace-nowrap"
                            >
                                မှာယူမည်
                            </button>
                        </div>
                    )
                })}
                {filteredMenuItems.length === 0 && (
                    <div className="text-center text-xs text-gray-400 py-10">ဤအမျိုးအစားတွင် ဟင်းပွဲများ မရှိသေးပါ သို့မဟုတ် ဒေတာချိတ်ဆက်မှု ပြတ်တောက်နေပါသည်။</div>
                )}
            </div>

            {/* Add-on Selection Modal */}
            {activeItem && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-gray-800 text-base">{activeItem.name}</h3>
                                <p className="text-xs text-orange-600 font-bold mt-0.5">+{(activeItem.price || 0).toLocaleString()} MMK</p>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">✕</button>
                        </div>
                        <hr className="border-gray-100" />
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 mb-2">အပိုထပ်ဆောင်း ရွေးချယ်ရန် (Add-ons)</h4>
                            <div className="space-y-2">
                                {(activeItem.flattenAddons || []).map((addon: any) => {
                                    if (!addon) return null
                                    const isChecked = !!selectedAddons.find(a => a.id === addon.id)
                                    return (
                                        <label key={addon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50/40">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleAddon(addon)}
                                                    className="w-4 h-4 accent-orange-500"
                                                />
                                                <span className="text-sm font-semibold text-gray-700">{addon.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">+{(addon.price || 0).toLocaleString()} MMK</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                        <button onClick={confirmAddonToCart} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl transition shadow">
                            ခြင်းတောင်းထဲသို့ ထည့်မည်
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Cart Panel */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-4 shadow-2xl rounded-t-3xl space-y-4 z-40 max-h-[50vh] overflow-y-auto">
                    <div className="space-y-2 max-h-32 overflow-y-auto divide-y divide-gray-100 pr-1">
                        <h4 className="text-xs font-bold text-gray-400">🛒 ရွေးချယ်ထားသော ဟင်းပွဲများ ({cart.length})</h4>
                        {cart.map(c => {
                            const addonsPrice = c.selectedAddons?.reduce((s: number, a: any) => s + (a?.price || 0), 0) || 0
                            const perItemPrice = (c.menuItem?.price || 0) + addonsPrice
                            return (
                                <div key={c.cartId} className="flex justify-between items-center py-2.5 text-xs">
                                    <div className="flex-1 pr-2">
                                        <span className="font-bold text-gray-800">{c.menuItem?.name}</span>
                                        {c.selectedAddons?.length > 0 && (
                                            <span className="block text-[10px] text-orange-600">
                                                ({c.selectedAddons.map((a: any) => a?.name).join(', ')})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 border rounded-lg bg-gray-50 p-1 mr-3">
                                        <button onClick={() => updateCartQuantity(c.cartId, -1)} className="w-5 h-5 bg-white rounded text-gray-600 font-bold shadow-sm">-</button>
                                        <span className="font-bold w-4 text-center">{c.quantity}</span>
                                        <button onClick={() => updateCartQuantity(c.cartId, 1)} className="w-5 h-5 bg-orange-500 text-white rounded font-bold shadow-sm">+</button>
                                    </div>
                                    <span className="font-black text-slate-700">{(perItemPrice * c.quantity).toLocaleString()} MMK</span>
                                </div>
                            )
                        })}
                    </div>
                    <div>
                        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="မီးဖိုချောင်သို့ မှာကြားလိုသည်များ..." className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500" />
                    </div>
                    <div className="flex justify-between items-center gap-4 border-t pt-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium">စုစုပေါင်းကျသင့်ငွေ</p>
                            <p className="text-base font-black text-slate-900">{totalAmount.toLocaleString()} MMK</p>
                        </div>
                        <button onClick={handleOrderSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl transition shadow-md text-center">
                            🚀 မီးဖိုချောင်သို့ အော်ဒါပို့မည်
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}