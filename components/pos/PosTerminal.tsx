'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import ReceiptPrinter, { ReceiptData } from './ReceiptPrinter'
import AddonSelectionModal from './AddonSelectionModal'

type CartItem = {
    id: string; // unique local ID for cart management
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    addons: { addonId: string, name: string, price: number }[];
}

export default function PosTerminal({ 
    menuItems, 
    categories, 
    tables,
    branchId,
    initialTableNumber
}: { 
    menuItems: any[], 
    categories: any[], 
    tables: any[],
    branchId: string,
    initialTableNumber?: string
}) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
    
    // Addon Modal State
    const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)
    const [selectedMenuItemForAddon, setSelectedMenuItemForAddon] = useState<any>(null)

    // Offline Capability State
    const [isOnline, setIsOnline] = useState(true)
    const [offlineOrders, setOfflineOrders] = useState<any[]>([])
    const [billRequests, setBillRequests] = useState<any[]>([])
    
    // Find initial table if provided via scan
    const initialTable = tables.find(t => t.number === initialTableNumber)
    const [selectedTableId, setSelectedTableId] = useState<string | null>(initialTable ? initialTable.id : null)

    // Active Table Order State
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [existingItems, setExistingItems] = useState<{menuItemId?: string, name: string, quantity: number, price: number, addons?: any[]}[]>([])
    const [isBillRequested, setIsBillRequested] = useState(false)
    const [promoCodeInput, setPromoCodeInput] = useState("")
    const [appliedPromo, setAppliedPromo] = useState<{code: string, amount: number} | null>(null)
    const [promoError, setPromoError] = useState("")
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
    const [existingTotal, setExistingTotal] = useState(0)

    // Load active order when table changes
    useEffect(() => {
        const loadActiveOrder = async () => {
            if (!selectedTableId || !isOnline) {
                setActiveOrderId(null)
                setExistingItems([])
                setExistingTotal(0)
                setIsBillRequested(false)
                setCart([])
                return;
            }
            try {
                const { getActiveTableOrder } = await import('@/server/actions/orders')
                const res = await getActiveTableOrder(selectedTableId)
                if (res.success && res.data) {
                    setActiveOrderId(res.data.id)
                    const itemsArray = (res.data.items as any[]) || []
                    setExistingItems(itemsArray.map((i: any) => ({
                        name: i.name,
                        quantity: i.quantity,
                        price: i.price,
                        addons: i.addons?.map((a: any) => ({ name: a.name })) || []
                    })))
                    setExistingTotal(res.data.totalAmount)
                    setIsBillRequested(res.data.isBillRequested)
                } else {
                    setActiveOrderId(null)
                    setExistingItems([])
                    setExistingTotal(0)
                    setIsBillRequested(false)
                }
                setCart([])
            } catch (e) {}
        }
        loadActiveOrder()
    }, [selectedTableId, isOnline])

    // Poll for global bill requests
    useEffect(() => {
        if (!isOnline) return;
        
        const fetchRequests = async () => {
            try {
                const { getPendingBillRequests } = await import('@/server/actions/orders')
                const res = await getPendingBillRequests(branchId)
                if (res.success && res.data) {
                    setBillRequests(res.data)
                }
            } catch (e: any) {
                if (e?.message?.includes('unexpected response') || e?.message?.includes('Unexpected token')) {
                    window.location.href = '/login?error=session_expired'
                }
            }
        }
        
        fetchRequests()
        const intervalId = setInterval(fetchRequests, 10000)
        return () => clearInterval(intervalId)
    }, [branchId, isOnline])

    // 1. Network Detection & Load Offline Orders
    useEffect(() => {
        setIsOnline(navigator.onLine)
        
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        
        // Load saved offline orders on mount
        const saved = localStorage.getItem('pos_offline_orders')
        if (saved) {
            try { setOfflineOrders(JSON.parse(saved)) } catch(e){}
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // 2. Auto-Sync Offline Orders when Online
    useEffect(() => {
        if (isOnline && offlineOrders.length > 0) {
            syncOfflineOrders()
        }
    }, [isOnline, offlineOrders])

    const syncOfflineOrders = async () => {
        if (offlineOrders.length === 0) return;
        const { syncOfflineTransactions } = await import('@/server/actions/offlineSync')
        
        const res = await syncOfflineTransactions(offlineOrders)
        if (res.success) {
            if (res.failedOrders && res.failedOrders.length > 0) {
                setOfflineOrders(res.failedOrders)
                localStorage.setItem('pos_offline_orders', JSON.stringify(res.failedOrders))
                alert(`⚠️ တချို့အော်ဒါများ Sync လုပ်၍မရပါ။`)
            } else {
                setOfflineOrders([])
                localStorage.removeItem('pos_offline_orders')
                alert(`✅ Offline အော်ဒါများကို ဆာဗာသို့ အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ!`)
            }
        }
    }
    
    
    // Filter menu items by selected category
    const displayItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.categoryId === selectedCategory)

    // Calculate discounted price
    const getFinalPrice = (item: any) => {
        let finalPrice = item.price;
        if (item.discount && item.discount.isActive) {
            if (item.discount.type === 'PERCENTAGE') {
                finalPrice = finalPrice - (finalPrice * (item.discount.value / 100));
            } else {
                finalPrice = Math.max(0, finalPrice - item.discount.value);
            }
        }
        return finalPrice;
    }

    const handleItemClick = (item: any) => {
        if (item.addonCategories && item.addonCategories.length > 0) {
            setSelectedMenuItemForAddon(item)
            setIsAddonModalOpen(true)
        } else {
            addToCart(item, [])
        }
    }

    const addToCart = (item: any, selectedAddons: any[]) => {
        const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0)
        const finalItemPrice = getFinalPrice(item)
        const newItem: CartItem = {
            id: Math.random().toString(36).substring(7),
            menuItemId: item.id,
            name: item.name,
            price: finalItemPrice + addonsPrice, // Cart item price includes addon price for easy display/calculation
            quantity: 1,
            addons: selectedAddons
        }
        setCart(prev => [...prev, newItem])
        setIsAddonModalOpen(false)
        setSelectedMenuItemForAddon(null)
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQ }
            }
            return item
        }))
    }

    const removeItem = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const cartTotal = existingTotal + cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalAmount = Math.max(0, cartTotal - (appliedPromo?.amount || 0))

    const handleApplyPromo = async () => {
        setPromoError("")
        if (!promoCodeInput.trim()) return
        
        setIsSubmitting(true)
        try {
            const { validatePromoCode } = await import('@/server/actions/promocodes')
            const res = await validatePromoCode(promoCodeInput, branchId, cartTotal)
            if (res.success && res.discountAmount) {
                setAppliedPromo({ code: promoCodeInput, amount: res.discountAmount })
                setPromoCodeInput("")
            } else {
                setPromoError(res.error || "Invalid code")
                setAppliedPromo(null)
            }
        } catch (error) {
            setPromoError("Failed to apply code")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSendOrder = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true)
        try {
            if (!isOnline) {
                alert("⚠️ KDS သို့ အော်ဒါပို့ရန် အင်တာနက်ချိတ်ဆက်မှု လိုအပ်ပါသည်။ ကျေးဇူးပြု၍ 'ဘေလ်ရှင်းမည်' ကို တိုက်ရိုက်အသုံးပြုပါ။");
                return;
            }
            const { sendOrderToKitchen } = await import('@/server/actions/orders')
            const res = await sendOrderToKitchen({
                orderId: activeOrderId || undefined,
                branchId,
                tableId: selectedTableId,
                items: cart.map(item => ({ 
                    menuItemId: item.menuItemId, 
                    quantity: item.quantity,
                    addons: item.addons
                }))
            })
            if (res.success) {
                alert("✅ အော်ဒါ မီးဖိုချောင်သို့ ပို့ပြီးပါပြီ")
                // reload table to get updated existing order
                const currentTable = selectedTableId
                setSelectedTableId(null)
                setTimeout(() => setSelectedTableId(currentTable), 50)
            } else {
                alert("❌ အမှားအယွင်း: " + res.error)
            }
        } catch (error) {
            // handle offline for send order later, basic error for now
            alert("⚠️ အင်တာနက်ချိတ်ဆက်မှု မရှိပါ သို့မဟုတ် အမှားအယွင်းဖြစ်ပေါ်နေပါသည်")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCheckout = async () => {
        if (cart.length === 0 && !activeOrderId) return;
        setIsSubmitting(true)

        try {
            if (!isOnline) {
                // OFF-LINE MODE CHECKOUT
                const tax = totalAmount * 0.05;
                const final = totalAmount + tax;

                const offlineTxn = {
                    id: Math.random().toString(36).substring(7),
                    branchId,
                    tableId: selectedTableId,
                    items: [
                        ...existingItems.map(c => ({ menuItemId: c.menuItemId || '', name: c.name, quantity: c.quantity, price: c.price, addons: c.addons || [] })),
                        ...cart.map(c => ({ menuItemId: c.menuItemId, name: c.name, quantity: c.quantity, price: c.price, addons: c.addons || [] }))
                    ],
                    totalAmount: cartTotal,
                    taxAmount: tax,
                    finalAmount: final,
                    discountAmount: appliedPromo?.amount || 0,
                    promoCode: appliedPromo?.code || null,
                    createdAt: new Date().toISOString()
                }

                const newOfflineOrders = [...offlineOrders, offlineTxn]
                setOfflineOrders(newOfflineOrders)
                localStorage.setItem('pos_offline_orders', JSON.stringify(newOfflineOrders))

                // Print receipt
                setReceiptData({
                    orderId: "OFFLINE-" + offlineTxn.id,
                    date: new Date(),
                    items: offlineTxn.items.map(c => ({
                        name: c.name + (c.addons?.length ? ` (${c.addons.map((a: any) => a.name).join(', ')})` : ''),
                        price: c.price,
                        quantity: c.quantity
                    })),
                    totalAmount: cartTotal,
                    taxAmount: tax,
                    finalAmount: final
                })
                setTimeout(() => window.print(), 100)

                alert(`✅ အော့ဖ်လိုင်း (Offline) ဖြင့် ဘေလ်ရှင်းရန် အောင်မြင်ပါသည်! (စက်ထဲတွင် သိမ်းဆည်းထားပါသည်)`)
                setAppliedPromo(null)
                setCart([])
                setExistingItems([])
                setExistingTotal(0)
                setActiveOrderId(null)
                setIsBillRequested(false)
                setIsCartOpen(false)
                setSelectedTableId(null)
                setIsSubmitting(false)
                return;
            }
            
            const { sendOrderToKitchen, checkoutOrder } = await import('@/server/actions/orders')
            
            let currentOrderId = activeOrderId

            // If there are unsent items in cart, send them first
            if (cart.length > 0) {
                const sendRes = await sendOrderToKitchen({
                    orderId: activeOrderId || undefined,
                    branchId,
                    tableId: selectedTableId,
                    items: cart.map(item => ({ 
                        menuItemId: item.menuItemId, 
                        quantity: item.quantity,
                        addons: item.addons
                    }))
                })
                if (sendRes.success && sendRes.orderId) {
                    currentOrderId = sendRes.orderId
                } else {
                    throw new Error(sendRes.error || "Failed to save order")
                }
            }

            if (!currentOrderId) throw new Error("No active order to checkout")

            // Checkout
            const checkRes = await checkoutOrder(currentOrderId, 'CASH', appliedPromo?.code)
            if (checkRes.success && checkRes.order) {
                // Print receipt
                setReceiptData({
                    orderId: checkRes.order.id,
                    date: checkRes.order.createdAt || new Date(),
                    items: [
                        ...existingItems.map(c => ({
                            name: c.name + (c.addons?.length ? ` (${c.addons.map((a: any) => a.name).join(', ')})` : ''),
                            price: c.price,
                            quantity: c.quantity
                        })),
                        ...cart.map(c => ({ 
                            name: c.name + (c.addons?.length ? ` (${c.addons.map(a => a.name).join(', ')})` : ''), 
                            price: c.price, 
                            quantity: c.quantity 
                        }))
                    ],
                    totalAmount: checkRes.order.totalAmount,
                    taxAmount: checkRes.order.taxAmount,
                    finalAmount: checkRes.order.finalAmount
                })
                setTimeout(() => window.print(), 100)

                alert(`✅ ဘေလ်ရှင်းရန် အောင်မြင်ပါသည်! စုစုပေါင်း: ${checkRes.order.finalAmount} MMK`)
                setAppliedPromo(null)
                setCart([])
                setExistingItems([])
                setExistingTotal(0)
                setActiveOrderId(null)
                setIsBillRequested(false)
                setIsCartOpen(false)
                setSelectedTableId(null)
            } else {
                alert('❌ အမှားအယွင်းရှိနေပါသည်: ' + checkRes.error)
            }
        } catch (error: any) {
            alert(`⚠️ အမှားအယွင်းဖြစ်ပေါ်နေပါသည်: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex h-full relative print:block">
            <ReceiptPrinter data={receiptData} />
            
            <div className="flex flex-1 h-full w-full relative print:hidden">
                <AddonSelectionModal 
                    isOpen={isAddonModalOpen}
                    onClose={() => {
                        setIsAddonModalOpen(false);
                        setSelectedMenuItemForAddon(null);
                    }}
                    menuItem={selectedMenuItemForAddon}
                    onAddToCart={addToCart}
                />

                {/* Bill Requests Notifications */}
                {billRequests.length > 0 && (
                    <div className="absolute top-4 right-4 md:right-[420px] z-50 flex flex-col gap-2 w-full max-w-xs">
                        {billRequests.map(req => (
                            <div key={req.id} className="bg-gradient-to-r from-rose-600 to-red-600 text-black p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 border border-rose-400">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl origin-top animate-[wiggle_1s_ease-in-out_infinite]">🔔</span>
                                    <div className="leading-tight">
                                        <p className="font-bold text-sm">ဘေလ်တောင်းထားသည်</p>
                                        <p className="text-xs text-rose-200 mt-0.5">စားပွဲ {req.table?.number}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedTableId(req.tableId)
                                        if (window.innerWidth < 768) setIsCartOpen(true)
                                    }}
                                    className="bg-white text-rose-600 px-3 py-2 rounded-xl text-xs font-black shadow-md hover:bg-rose-50 active:scale-95 transition-all"
                                >
                                    ကြည့်မည်
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* === ဘယ်ဘက်ခြမ်း: Menu Items & Categories === */}
                <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
                    {!isOnline && (
                        <div className="bg-red-600 text-white text-xs font-bold p-2 text-center flex justify-center items-center gap-2 shadow-sm shrink-0">
                            <span>🔴 အော့ဖ်လိုင်း (Offline Mode) - အင်တာနက်မရှိပါ</span>
                            {offlineOrders.length > 0 && (
                                <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-3xs shadow-inner">
                                    {offlineOrders.length} Pending Orders
                                </span>
                            )}
                        </div>
                    )}
                    {/* Categories Banner */}
                    <div className="p-4 bg-gray-50/50 border-b border-gray-200 overflow-x-auto no-scrollbar shrink-0">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${selectedCategory === 'all' ? 'bg-black text-white shadow-lg shadow-gray-900/10' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black'}`}
                            >
                                အားလုံး (All)
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-black text-white shadow-lg shadow-gray-900/10' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                {/* Menu Items Grid */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-28 lg:pb-6 content-start">
                    {displayItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:shadow-lg hover:shadow-black/10 transition-all flex flex-col group relative overflow-hidden active:scale-95"
                        >
                            {/* 🖼️ Hero Image */}
                            {item.imageUrl ? (
                                <div className="w-full h-40 bg-gray-200 relative">
                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                                </div>
                            ) : (
                                <div className="w-full h-32 bg-gray-200 flex items-center justify-center relative">
                                    <span className="text-gray-300 text-3xl">🍽️</span>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col justify-between -mt-6 relative z-10">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-800 transition-colors line-clamp-2 drop-shadow-md">{item.name}</h3>
                                    <span className="text-3xs text-gray-500 mt-1 uppercase tracking-wider">{item.category?.name}</span>
                                </div>
                                <div className="mt-4 font-black font-mono">
                                    {item.discount && item.discount.isActive ? (
                                        <div className="flex flex-col">
                                            <span className="text-3xs text-gray-400 line-through leading-none">{item.price.toLocaleString()} MMK</span>
                                            <span className="text-rose-400 leading-tight">{getFinalPrice(item).toLocaleString()} <span className="text-3xs font-normal">MMK</span></span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-800">{item.price.toLocaleString()} <span className="text-3xs text-gray-400 font-normal">MMK</span></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {displayItems.length === 0 && (
                        <div className="col-span-full h-40 flex items-center justify-center text-sm text-gray-400">
                            မီနူးများ မရှိသေးပါ
                        </div>
                    )}
                </div>
            </div>

            {/* === ညာဘက်ခြမ်း: Shopping Cart (Desktop Sidebar / Mobile Bottom Sheet) === */}
            <div className={`
                fixed inset-y-0 right-0 z-40 w-full md:w-[400px] bg-gray-50 border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
                ${isCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                md:relative md:z-0
            `}>
                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white/50">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                            <span className="text-black">🛒</span> Current Order
                        </h2>
                        {isBillRequested && (
                            <span className="text-xs bg-rose-500 text-black font-bold px-2 py-1 rounded-full animate-pulse mt-2 mb-1 inline-block text-center shadow-lg shadow-rose-500/20 border border-rose-400">
                                🔔 ဘေလ်ရှင်းရန် တောင်းဆိုထားသည်
                            </span>
                        )}
                        {/* Offline & Syncing Status Badges */}
                        <div className="flex items-center gap-2 mt-1">
                            {!isOnline && (
                                <span className="text-3xs font-bold bg-red-500/20 text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Offline
                                </span>
                            )}
                            {offlineOrders.length > 0 && (
                                <span className="text-3xs font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded flex items-center gap-1">
                                    ⏳ Syncing ({offlineOrders.length})
                                </span>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500"
                    >
                        ✕
                    </button>
                </div>

                {/* Table Selector */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">စားပွဲ ရွေးချယ်ရန် (Table)</label>
                    <select 
                        value={selectedTableId || ''} 
                        onChange={(e) => setSelectedTableId(e.target.value || null)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
                    >
                        <option value="">ပါဆယ် (Takeaway)</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.id}>
                                စားပွဲ {table.number}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Existing Items */}
                    {existingItems.map((item, index) => (
                        <div key={`exist-${index}`} className="bg-gray-50 border border-gray-300/50 rounded-xl p-3 flex justify-between gap-3 opacity-70">
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-700 leading-tight">{item.name}</h4>
                                {item.addons && item.addons.length > 0 && (
                                    <p className="text-3xs text-gray-400 mt-0.5 leading-tight">
                                        {item.addons.map((a: any) => a.name).join(', ')}
                                    </p>
                                )}
                                <p className="text-xs font-mono text-gray-500 mt-1">{(item.price * item.quantity).toLocaleString()} MMK</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-8 text-center text-xs font-bold text-gray-500">Qty: {item.quantity}</span>
                            </div>
                        </div>
                    ))}
                    {/* New Items */}
                    {cart.map((item, index) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between gap-3 animate-in fade-in slide-in-from-right-4">
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-800 leading-tight">{item.name}</h4>
                                {item.addons && item.addons.length > 0 && (
                                    <p className="text-3xs text-gray-500 mt-0.5 leading-tight">
                                        {item.addons.map(a => a.name).join(', ')}
                                    </p>
                                )}
                                <p className="text-xs font-mono text-gray-800 mt-1">{(item.price * item.quantity).toLocaleString()} MMK</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-l-lg transition-colors text-lg">−</button>
                                    <span className="w-6 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-r-lg transition-colors text-lg">+</button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && existingItems.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 opacity-60 min-h-[200px]">
                            <span className="text-5xl">🛒</span>
                            <p className="text-xs uppercase font-bold tracking-wider">ဘေလ်ရှင်းရန် မရှိသေးပါ</p>
                        </div>
                    )}
                </div>

                {/* Promo Code Section */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                    {appliedPromo ? (
                        <div className="flex justify-between items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                            <span className="font-bold text-xs flex items-center gap-2">🎟️ Promo Applied: {appliedPromo.code}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-black font-mono">-{appliedPromo.amount.toLocaleString()} MMK</span>
                                <button onClick={() => setAppliedPromo(null)} className="text-red-500 hover:text-red-700 font-black text-xs">✕</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter Promo Code" 
                                    value={promoCodeInput}
                                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none focus:border-gray-1000"
                                />
                                <button 
                                    onClick={handleApplyPromo}
                                    disabled={!promoCodeInput || isSubmitting}
                                    className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                                >
                                    Apply
                                </button>
                            </div>
                            {promoError && <p className="text-red-500 text-3xs font-bold mt-1.5 ml-1">{promoError}</p>}
                        </div>
                    )}
                </div>

                <div className="p-5 bg-white border-t border-gray-200 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 font-mono">
                            {totalAmount.toLocaleString()} MMK
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSendOrder}
                            disabled={(cart.length === 0 || isSubmitting) ? true : undefined}
                            className="flex-1 bg-gray-200 hover:bg-slate-700 disabled:bg-gray-50 disabled:text-gray-300 text-black text-xs font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center"
                        >
                            👨‍🍳 အော်ဒါပို့မည်
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={((cart.length === 0 && !activeOrderId) || isSubmitting) ? true : undefined}
                            className="flex-[2] bg-gray-900 hover:bg-black disabled:from-slate-800 disabled:to-slate-800 disabled:text-gray-400 text-white text-sm font-black py-3 rounded-xl transition-all shadow-lg hover:shadow-gray-900/10 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Processing..." : "💸 ဘေလ်ရှင်းမည်"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile View Cart FAB */}
            {!isCartOpen && (
                <div className="md:hidden fixed bottom-6 left-4 right-4 z-30 pb-[env(safe-area-inset-bottom)]">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-gray-900 text-white text-sm font-black py-4 rounded-2xl shadow-2xl shadow-gray-900/10 flex justify-between items-center px-6"
                    >
                        <span className="flex items-center gap-2">🛒 <span>{cart.length} Items</span></span>
                        <span>{totalAmount.toLocaleString()} MMK</span>
                    </button>
                </div>
            )}
            </div>
        </div>
    )
}
