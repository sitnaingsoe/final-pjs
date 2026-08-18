// app/scan/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { getMenuForTable, placeTableOrder, getActiveOrderForTableNumber, requestBillForTable, cancelTableOrder, cancelTableOrderItem } from '@/server/actions/tables'

export default function AdvancedCustomerScanPage() {
    const searchParams = useSearchParams()
    const tableId = searchParams.get('tableId')
    const tableNumber = searchParams.get('tableNumber') || 'Unknown'

    const [menuItems, setMenuItems] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

    const [cart, setCart] = useState<any[]>([])
    const [notes, setNotes] = useState('')
    const [isOrdered, setIsOrdered] = useState(false)
    const [loading, setLoading] = useState(true)

    // 🎯 View State: 'home' | 'detail' | 'cart' | 'status'
    const [currentView, setCurrentView] = useState<'home' | 'detail' | 'cart' | 'status'>('home')
    const [activeOrder, setActiveOrder] = useState<any | null>(null)
    const [isRequestingBill, setIsRequestingBill] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    const [activeItem, setActiveItem] = useState<any | null>(null)
    const [selectedAddons, setSelectedAddons] = useState<any[]>([])
    const [detailQuantity, setDetailQuantity] = useState(1)

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        async function loadData() {
            try {
                const res = await getMenuForTable(tableNumber, tableId)
                if (res && res.success) {
                    setMenuItems(res.menuItems || [])
                    setCategories(res.categories || [])
                }
                const orderRes = await getActiveOrderForTableNumber(tableNumber, tableId)
                if (orderRes && orderRes.success) {
                    setActiveOrder(orderRes.data)
                }
            } catch (err) {
                console.error("Data loading error:", err)
            } finally {
                setLoading(false)
            }
        }
        loadData()

        // Poll for order status every 10 seconds
        const intervalId = setInterval(async () => {
            try {
                const orderRes = await getActiveOrderForTableNumber(tableNumber, tableId)
                if (orderRes && orderRes.success) {
                    setActiveOrder(orderRes.data)
                }
            } catch (err) {
                console.error("Scan polling error:", err)
            }
        }, 10000)

        return () => clearInterval(intervalId)
    }, [tableNumber, tableId])

    // --- HOME VIEW ACTIONS ---
    const handleItemClick = (item: any) => {
        if (!item) return
        if (item.isActive === false) {
            alert(`"${item.name}" မှာ ခေတ္တ ကုန်နေပါသဖြင့် မှာယူ၍ မရပါ (Out of Stock)`)
            return
        }
        const allAddons = item.addonCategories?.flatMap(
            (cat: any) => cat?.addons || []
        ) || []

        setActiveItem({ ...item, flattenAddons: allAddons })
        setSelectedAddons([])
        setDetailQuantity(1)
        setCurrentView('detail')
    }

    const handleQuickAdd = (e: React.MouseEvent, item: any) => {
        e.stopPropagation()
        if (item.isActive === false) {
            alert(`"${item.name}" မှာ ခေတ္တ ကုန်နေပါသဖြင့် မှာယူ၍ မရပါ (Out of Stock)`)
            return
        }
        const allAddons = item.addonCategories?.flatMap(
            (cat: any) => cat?.addons || []
        ) || []
        
        if (allAddons.length > 0) {
            handleItemClick(item)
        } else {
            addToCartDirect(item, [], 1)
        }
    }

    // --- DETAIL VIEW ACTIONS ---
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
        addToCartDirect(activeItem, selectedAddons, detailQuantity)
        setActiveItem(null)
        setCurrentView('home')
    }

    // --- CART ACTIONS ---
    const addToCartDirect = (item: any, addons: any[], quantity: number) => {
        if (!item) return
        const addonIds = addons.map(a => a.id).sort().join(',')
        const cartId = `${item.id}-${addonIds}`

        setCart(prev => {
            const existingIndex = prev.findIndex(c => c.cartId === cartId)
            if (existingIndex > -1) {
                const updated = [...prev]
                updated[existingIndex].quantity += quantity
                return updated
            } else {
                return [...prev, { cartId, menuItem: item, quantity, selectedAddons: addons }]
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

    const getFinalPrice = (item: any) => {
        if (!item) return 0;
        let finalPrice = item.price || 0;
        if (item.discount && item.discount.isActive) {
            if (item.discount.type === 'PERCENTAGE') {
                finalPrice = finalPrice - (finalPrice * (item.discount.value / 100));
            } else {
                finalPrice = Math.max(0, finalPrice - item.discount.value);
            }
        }
        return finalPrice;
    }

    const totalAmount = cart.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((s: number, a: any) => s + (a?.price || 0), 0) || 0
        return sum + ((getFinalPrice(item.menuItem) + addonsTotal) * item.quantity)
    }, 0)

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    const handleOrderSubmit = async () => {
        if (cart.length === 0) return
        const orderItems = cart.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            addons: item.selectedAddons?.map((a: any) => ({ addonId: a.id, name: a.name, price: a.price }))
        }))

        const res = await placeTableOrder(tableNumber, orderItems, notes, tableId)
        if (res.success) {
            setIsOrdered(true)
            setCart([])
            const orderRes = await getActiveOrderForTableNumber(tableNumber, tableId)
            if (orderRes && orderRes.success) {
                setActiveOrder(orderRes.data)
            }
        } else {
            alert(res.error)
        }
    }

    const handleRequestBill = async () => {
        setIsRequestingBill(true)
        const res = await requestBillForTable(tableNumber, tableId)
        setIsRequestingBill(false)
        if (res.success) {
            alert('ဘေလ်တောင်းဆိုမှု အောင်မြင်ပါသည်။ ခေတ္တစောင့်ဆိုင်းပေးပါ။')
            const orderRes = await getActiveOrderForTableNumber(tableNumber, tableId)
            if (orderRes && orderRes.success) {
                setActiveOrder(orderRes.data)
            }
        } else {
            alert(res.error || 'ဘေလ်တောင်း၍မရပါ')
        }
    }

    const handleCancelOrder = async () => {
        if (!activeOrder) return
        if (!confirm('အော်ဒါကို ပယ်ဖျက်ရန် သေချာပါသလား။')) return

        setIsCancelling(true)
        const res = await cancelTableOrder(activeOrder.id)
        setIsCancelling(false)

        if (res.success) {
            alert('အော်ဒါကို ပယ်ဖျက်လိုက်ပါပြီ။')
            setIsOrdered(false)
            setActiveOrder(null)
            setCurrentView('home')
        } else {
            alert(res.error || 'အော်ဒါဖျက်၍မရပါ')
        }
    }

    const handleCancelOrderItem = async (itemIndex: number) => {
        if (!activeOrder) return
        if (!confirm('ဤဟင်းပွဲကို ဖျက်ရန် သေချာပါသလား။')) return

        setIsCancelling(true)
        const res = await cancelTableOrderItem(activeOrder.id, itemIndex)
        setIsCancelling(false)

        if (res.success && res.data) {
            alert('ဟင်းပွဲကို ပယ်ဖျက်လိုက်ပါပြီ။')
            const updatedOrder = res.data
            const items = (updatedOrder.items as any[]) || []
            const hasActiveItems = items.some((i: any) => i.status !== 'CANCELLED')
            if (!hasActiveItems) {
                setIsOrdered(false)
                setActiveOrder(null)
                setCurrentView('home')
            } else {
                setActiveOrder(updatedOrder)
            }
        } else {
            alert(res.error || 'ဟင်းပွဲဖျက်၍မရပါ')
        }
    }

    // --- DATA FILTERS ---
    const safeMenuItems = Array.isArray(menuItems) ? menuItems : []
    const filteredMenuItems = selectedCategory === 'ALL'
        ? safeMenuItems
        : safeMenuItems.filter(item => item && item.categoryId === selectedCategory)

    if (!mounted) return null
    if (loading) return <div className="h-screen flex items-center justify-center text-sm font-medium">မီနူးများ တင်နေပါသည်...</div>

    if (isOrdered) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-green-50">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-green-800">အော်ဒါ မီးဖိုချောင်သို့ ရောက်သွားပါပြီ။</h2>
                <p className="text-sm text-green-600 mt-2">စားပွဲနံပါတ် [ {tableNumber} ] အတွက် ဟင်းပွဲများကို ပြင်ဆင်နေပါပြီ။</p>
                <button onClick={() => { setIsOrdered(false); setCurrentView('home') }} className="mt-8 bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                    နောက်ထပ်မှာယူမည်
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">

            {/* =======================
                VIEW 1: HOME
            ======================== */}
            {currentView === 'home' && (
                <div className="flex-1 overflow-y-auto pb-24 animate-in fade-in duration-300">
                    <header className="bg-gray-50 text-black p-5 sticky top-0 shadow-md z-30 rounded-b-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-lg font-bold tracking-wide text-black">မြန်မာ့ရသာ</h1>
                                <p className="text-xs text-gray-400">QR Mobile Ordering</p>
                            </div>
                            <div className="bg-black text-white font-bold px-4 py-1.5 rounded-full text-sm shadow">
                                🍽️ စားပွဲ - {tableNumber}
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                            <button
                                onClick={() => setSelectedCategory('ALL')}
                                className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === 'ALL' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
                            >
                                အားလုံး
                            </button>
                            {(Array.isArray(categories) ? categories : []).map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === cat.id ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </header>

                    {/* 🔥 PROMOTIONAL DEALS & SPECIAL OFFERS MULTI-ITEM CAROUSEL */}
                    {(() => {
                        const discountedItems = safeMenuItems.filter(i => i && i.discount && i.discount.isActive)

                        return (
                            <div className="pt-4">
                                <div className="px-4 flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-900">
                                        <span className="text-red-600 animate-pulse">🔥</span>
                                        <span>TODAY'S SPECIAL OFFERS</span>
                                    </div>
                                    {discountedItems.length > 1 && (
                                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                            {discountedItems.length} Deals Active
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory no-scrollbar">
                                    {discountedItems.length > 0 ? (
                                        discountedItems.map((item, idx) => {
                                            const gradients = [
                                                'from-red-600 via-rose-600 to-amber-600 shadow-red-500/20',
                                                'from-purple-600 via-indigo-600 to-blue-600 shadow-purple-500/20',
                                                'from-emerald-600 via-teal-600 to-cyan-600 shadow-emerald-500/20',
                                                'from-amber-600 via-orange-600 to-red-600 shadow-amber-500/20'
                                            ]
                                            const bgGradient = gradients[idx % gradients.length]

                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => handleItemClick(item)}
                                                    className={`w-[85%] sm:w-[90%] shrink-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-r ${bgGradient} p-4 sm:p-5 text-white shadow-xl cursor-pointer group active:scale-[0.98] transition-all`}
                                                >
                                                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                                    <div className="relative z-10 flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5 text-amber-200 border border-white/20">
                                                                <span>🔥 DEAL #{idx + 1}</span>
                                                            </div>
                                                            <h2 className="text-base font-black tracking-tight line-clamp-1 group-hover:underline">
                                                                {item.name}
                                                            </h2>
                                                            <div className="flex items-baseline gap-2 mt-1">
                                                                <span className="text-lg font-black text-white">
                                                                    {getFinalPrice(item).toLocaleString()} MMK
                                                                </span>
                                                                <span className="text-xs text-white/70 line-through font-medium">
                                                                    {(item.price || 0).toLocaleString()} MMK
                                                                </span>
                                                            </div>
                                                            <span className="inline-block mt-2 text-[9px] font-black bg-white text-gray-900 px-2.5 py-1 rounded-xl uppercase tracking-wider shadow">
                                                                {item.discount.type === 'PERCENTAGE' 
                                                                    ? `SAVE ${item.discount.value}% NOW`
                                                                    : `SAVE ${item.discount.value.toLocaleString()} MMK`}
                                                            </span>
                                                        </div>

                                                        {item.imageUrl ? (
                                                            <div className="w-20 h-20 rounded-2xl overflow-hidden relative shrink-0 shadow-md border-2 border-white/30 bg-black/20">
                                                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shrink-0">
                                                                🍲
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <>
                                            <div className="w-[85%] shrink-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-gray-900 to-black p-4 text-white shadow-xl">
                                                <div className="absolute right-0 top-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl"></div>
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div>
                                                        <div className="inline-block bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 border border-amber-400/30">
                                                            ✨ CHEF'S RECOMMENDATION
                                                        </div>
                                                        <h2 className="text-sm font-black text-white tracking-tight">Freshly Prepared Delicious Meals</h2>
                                                        <p className="text-[10px] text-gray-300 mt-0.5">Order directly from your phone!</p>
                                                    </div>
                                                    <div className="text-3xl">🍲</div>
                                                </div>
                                            </div>

                                            <div className="w-[85%] shrink-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 via-rose-950 to-black p-4 text-white shadow-xl">
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div>
                                                        <div className="inline-block bg-red-400/20 text-red-300 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 border border-red-400/30">
                                                            ⚡ FAST SERVICE
                                                        </div>
                                                        <h2 className="text-sm font-black text-white tracking-tight">Table QR Express Ordering</h2>
                                                        <p className="text-[10px] text-gray-300 mt-0.5">Kitchen notified instantly upon order placement.</p>
                                                    </div>
                                                    <div className="text-3xl">⚡</div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })()}

                    <div className="p-4 space-y-4">
                        {filteredMenuItems.map(item => {
                            if (!item) return null
                            return (
                                <div key={item.id} onClick={() => handleItemClick(item)} className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden relative transition-transform ${item.isActive !== false ? 'cursor-pointer active:scale-[0.98]' : 'opacity-60 cursor-not-allowed bg-gray-50'}`}>
                                    <div className="w-28 h-28 bg-gray-100 shrink-0 relative">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 33vw, 20vw" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/5"></div>

                                        {/* Red Discount Tag */}
                                        {item.discount && item.discount.isActive && item.isActive !== false && (
                                            <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md z-10">
                                                {item.discount.type === 'PERCENTAGE' ? `-${item.discount.value}%` : `-${item.discount.value.toLocaleString()} MMK`}
                                            </div>
                                        )}

                                        {/* Out of Stock Overlay Badge */}
                                        {item.isActive === false && (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 p-1">
                                                <span className="bg-red-600 text-white font-black text-[9px] px-2 py-1 rounded-md uppercase tracking-widest shadow text-center leading-tight">
                                                    OUT OF STOCK
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</div>
                                            <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{item.description || '-'}</div>
                                            {item.addonCategories && item.addonCategories.length > 0 && (
                                                <span className="inline-block text-[9px] bg-gray-50 text-gray-900 px-1.5 py-0.5 rounded font-bold mt-1 border border-gray-200">
                                                    ➕ Add-ons ရွေးချယ်နိုင်သည်
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-sm font-black">
                                                {item.discount && item.discount.isActive ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 line-through leading-none">{(item.price || 0).toLocaleString()} MMK</span>
                                                        <span className="text-red-600 leading-tight">{getFinalPrice(item).toLocaleString()} MMK</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-900">{(item.price || 0).toLocaleString()} MMK</span>
                                                )}
                                            </div>
                                            {item.isActive !== false ? (
                                                <button onClick={(e) => handleQuickAdd(e, item)} className="bg-gray-50 text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100">
                                                    + မှာမည်
                                                </button>
                                            ) : (
                                                <button disabled className="bg-gray-100 text-red-500 text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-not-allowed uppercase border border-red-200">
                                                    ကုန်သွားပါပြီ
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {filteredMenuItems.length === 0 && (
                            <div className="text-center text-xs text-gray-400 py-10 flex flex-col items-center">
                                <span className="text-3xl mb-2 opacity-50">🍽️</span>
                                <span>ဟင်းပွဲများ မရှိသေးပါ</span>
                            </div>
                        )}
                    </div>

                    {/* Floating Buttons on Home */}
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-4 z-40 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
                        {activeOrder && (
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentView('status')} className="flex-1 bg-gray-200 text-black font-bold py-3 px-4 rounded-2xl shadow-lg flex justify-between items-center border border-gray-300">
                                    <span className="flex items-center gap-2">
                                        🧾 <span className="hidden sm:inline">အော်ဒါ</span>
                                    </span>
                                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">{activeOrder.status}</span>
                                </button>
                                <button 
                                    onClick={handleRequestBill}
                                    disabled={isRequestingBill || activeOrder.isBillRequested}
                                    className="flex-1 bg-gray-900 hover:bg-black disabled:bg-slate-300 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-2xl shadow-lg flex justify-center items-center gap-1 transition"
                                >
                                    {isRequestingBill ? 'တောင်းနေပါသည်' : activeOrder.isBillRequested ? 'ဘေလ်တောင်းထားသည်' : '💸 ဘေလ်တောင်းမည်'}
                                </button>
                            </div>
                        )}
                        {cart.length > 0 && (
                            <button onClick={() => setCurrentView('cart')} className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-gray-900/10 flex justify-between items-center">
                                <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-sm">
                                    🛒 <span>{totalCartItems} ခု</span>
                                </span>
                                <span>{totalAmount.toLocaleString()} MMK <span className="text-xl ml-1">→</span></span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* =======================
                VIEW 2: MENU DETAIL
            ======================== */}
            {currentView === 'detail' && activeItem && (
                <div className="bg-white min-h-screen animate-in slide-in-from-right duration-300 flex flex-col z-50">
                    {/* Detail Header / Hero Image */}
                    <div className="relative w-full h-72 bg-gray-200 shrink-0">
                        {activeItem.imageUrl ? (
                            <Image src={activeItem.imageUrl} alt={activeItem.name} fill className="object-cover" sizes="100vw" priority />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-500"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                        <button onClick={() => setCurrentView('home')} className="absolute top-4 left-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                    </div>

                    <div className="p-6 -mt-6 bg-white rounded-t-3xl relative z-10 flex-1 flex flex-col shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{activeItem.name}</h2>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{activeItem.description || "ဖော်ပြချက် မရှိပါ"}</p>
                            {activeItem.discount && activeItem.discount.isActive ? (
                                <div className="mt-3 flex items-end gap-2">
                                    <p className="text-xl font-black text-gray-900">{getFinalPrice(activeItem).toLocaleString()} MMK</p>
                                    <p className="text-sm text-gray-400 line-through mb-0.5">{(activeItem.price || 0).toLocaleString()} MMK</p>
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold mb-1 ml-2">
                                        {activeItem.discount.type === 'PERCENTAGE' ? `${activeItem.discount.value}% OFF` : `${activeItem.discount.value} MMK OFF`}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xl font-black text-gray-900 mt-3">{(activeItem.price || 0).toLocaleString()} MMK</p>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                            {activeItem.addonCategories?.length > 0 && (
                                <div className="space-y-6">
                                    {activeItem.addonCategories.map((cat: any) => {
                                        const categoryName = cat?.name || "Add-ons"
                                        const addons = cat?.addons || []
                                        if (addons.length === 0) return null

                                        return (
                                            <div key={cat.id}>
                                                <h3 className="text-sm font-bold text-gray-800 mb-3 bg-gray-100 py-1.5 px-3 rounded-lg inline-flex items-center gap-2">
                                                    ✨ {categoryName}
                                                </h3>
                                                <div className="space-y-3">
                                                    {addons.map((addon: any) => {
                                                        const isChecked = !!selectedAddons.find(a => a.id === addon.id)
                                                        return (
                                                            <label key={addon.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${isChecked ? 'bg-gray-50 border-gray-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <input type="checkbox" checked={isChecked} onChange={() => toggleAddon(addon)} className="w-5 h-5 accent-gray-900" />
                                                                    <span className={`text-sm font-bold ${isChecked ? 'text-black' : 'text-gray-700'}`}>{addon.name}</span>
                                                                </div>
                                                                <span className="text-sm font-black text-gray-500">+{(addon.price || 0).toLocaleString()} MMK</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-700">အရေအတွက် ရွေးချယ်ရန်</span>
                                <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                    <button onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">-</button>
                                    <span className="w-4 text-center font-black text-gray-800">{detailQuantity}</span>
                                    <button onClick={() => setDetailQuantity(detailQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-black font-bold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">+</button>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Add to Cart Footer */}
                        <div className="pt-4 mt-auto shrink-0 bg-white">
                            <button onClick={confirmAddonToCart} className="w-full bg-gray-900 text-white text-base font-black py-4 rounded-2xl shadow-xl shadow-gray-900/10 active:scale-95 transition-transform flex justify-center items-center gap-2">
                                {( (getFinalPrice(activeItem) + selectedAddons.reduce((s,a) => s + a.price, 0)) * detailQuantity ).toLocaleString()} MMK - ခြင်းတောင်းသို့ထည့်မည်
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =======================
                VIEW 3: CART VIEW
            ======================== */}
            {currentView === 'cart' && (
                <div className="bg-white min-h-screen animate-in slide-in-from-right duration-300 flex flex-col z-50">
                    <header className="bg-gray-50 text-black p-4 sticky top-0 flex items-center justify-between z-30 shadow-md rounded-b-2xl">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setCurrentView('home')} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div>
                                <h2 className="text-lg font-bold">ခြင်းတောင်း</h2>
                                <p className="text-[10px] text-gray-400">Total {totalCartItems} Items</p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 pb-6">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <span className="text-6xl mb-4 opacity-50">🛒</span>
                                <p className="font-bold text-sm text-gray-500">ခြင်းတောင်းထဲတွင် ဘာမှမရှိသေးပါ</p>
                                <button onClick={() => setCurrentView('home')} className="mt-4 bg-gray-100 text-gray-900 px-6 py-2 rounded-full font-bold text-sm">
                                    မီနူးများ ပြန်ကြည့်မည်
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(c => {
                                    const addonsPrice = c.selectedAddons?.reduce((s: number, a: any) => s + (a?.price || 0), 0) || 0
                                    const perItemPrice = getFinalPrice(c.menuItem) + addonsPrice
                                    return (
                                        <div key={c.cartId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                                            {c.menuItem?.imageUrl ? (
                                                <Image src={c.menuItem.imageUrl} alt={c.menuItem.name} width={80} height={80} className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-100" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">🍽️</div>
                                            )}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{c.menuItem?.name}</h4>
                                                    </div>
                                                    {c.selectedAddons?.length > 0 && (
                                                        <p className="text-[10px] text-gray-900 font-bold mt-1 leading-tight bg-gray-50 inline-block px-2 py-0.5 rounded">
                                                            + {c.selectedAddons.map((a: any) => a?.name).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="font-black text-gray-900 text-sm">{(perItemPrice * c.quantity).toLocaleString()} MMK</span>
                                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-1">
                                                        <button onClick={() => updateCartQuantity(c.cartId, -1)} className="w-7 h-7 flex items-center justify-center text-gray-600 bg-white rounded shadow-sm font-bold hover:bg-gray-100">-</button>
                                                        <span className="font-bold text-sm w-4 text-center">{c.quantity}</span>
                                                        <button onClick={() => updateCartQuantity(c.cartId, 1)} className="w-7 h-7 flex items-center justify-center text-white bg-black rounded shadow-sm font-bold hover:bg-gray-800">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="bg-white p-6 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 mt-auto shrink-0 relative z-10">
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 mb-2 block">မှတ်ချက် (Optional)</label>
                                <textarea 
                                    rows={2} 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                    placeholder="အပူလျှော့၊ အစပ်လျှော့..." 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-black resize-none" 
                                />
                            </div>
                            
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-sm font-bold text-gray-500">စုစုပေါင်းကျသင့်ငွေ</span>
                                <span className="text-3xl font-black text-gray-900 tracking-tight">{totalAmount.toLocaleString()} <span className="text-sm text-gray-500 font-bold ml-1">MMK</span></span>
                            </div>

                            <button onClick={handleOrderSubmit} className="w-full bg-gray-900 hover:bg-black active:scale-95 text-white text-lg font-black py-4 rounded-2xl transition shadow-xl shadow-gray-900/10 flex justify-center items-center gap-2">
                                🚀 မီးဖိုချောင်သို့ အော်ဒါပို့မည်
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* =======================
                VIEW 4: ORDER STATUS
            ======================== */}
            {currentView === 'status' && activeOrder && (
                <div className="bg-white min-h-screen animate-in slide-in-from-right duration-300 flex flex-col z-50">
                    <header className="bg-gray-50 text-black p-4 sticky top-0 flex items-center justify-between z-30 shadow-md rounded-b-2xl">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setCurrentView('home')} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div>
                                <h2 className="text-lg font-bold">ငါ့ရဲ့အော်ဒါများ</h2>
                                <p className="text-[10px] text-gray-400">Order Status: {activeOrder.status}</p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 pb-6">
                        <div className="space-y-4">
                            {activeOrder.items?.map((item: any, originalIdx: number) => {
                                if (item.status === 'CANCELLED') return null
                                const addonsPrice = item.addons?.reduce((s: number, a: any) => s + (a?.price || 0), 0) || 0
                                const perItemPrice = item.price + addonsPrice
                                return (
                                    <div key={`${item.menuItemId}-${originalIdx}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name || item.menuItem?.name || "ဟင်းပွဲ"}</h4>
                                                    <span className="font-bold text-sm text-gray-500">x{item.quantity}</span>
                                                </div>
                                                {item.addons?.length > 0 && (
                                                    <p className="text-[10px] text-gray-900 font-bold mt-1 leading-tight bg-gray-50 inline-block px-2 py-0.5 rounded">
                                                        + {item.addons.map((a: any) => a?.name || "Addon").join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-3 flex justify-between items-center">
                                                <span className="font-black text-slate-800 text-sm">{(perItemPrice * item.quantity).toLocaleString()} MMK</span>
                                                {(item.status || 'PENDING') === 'PENDING' && (
                                                    <button 
                                                        onClick={() => handleCancelOrderItem(originalIdx)}
                                                        className="text-xs text-red-600 bg-red-50 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl transition active:scale-95"
                                                    >
                                                        ❌ ဖျက်မည်
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 mt-auto shrink-0 relative z-10">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-gray-500">စုစုပေါင်းကျသင့်ငွေ</span>
                            <span className="text-3xl font-black text-gray-900 tracking-tight">{activeOrder.totalAmount?.toLocaleString()} <span className="text-sm text-gray-500 font-bold ml-1">MMK</span></span>
                        </div>
                        {activeOrder.items?.some((item: any) => (item.status || 'PENDING') === 'PENDING') && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 mt-4 rounded-2xl shadow-lg flex justify-center items-center gap-1 transition-all active:scale-98"
                            >
                                {isCancelling ? 'ပယ်ဖျက်နေပါသည်...' : '❌ အော်ဒါဖျက်မည် (Cancel)'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}