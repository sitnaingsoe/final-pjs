'use client'

import React, { useState, useEffect } from 'react'
import ReceiptPrinter, { ReceiptData } from './ReceiptPrinter'

type CartItem = {
    id: string; // unique local ID for cart management
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    addons: any[];
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
    
    // Offline Capability State
    const [isOnline, setIsOnline] = useState(true)
    const [offlineOrders, setOfflineOrders] = useState<any[]>([])

    // Find initial table if provided via scan
    const initialTable = tables.find(t => t.number === initialTableNumber)
    const [selectedTableId, setSelectedTableId] = useState<string | null>(initialTable ? initialTable.id : null)

    // Active Table Order State
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
    const [existingItems, setExistingItems] = useState<{name: string, quantity: number, price: number}[]>([])
    const [existingTotal, setExistingTotal] = useState(0)

    // Load active order when table changes
    useEffect(() => {
        const loadActiveOrder = async () => {
            if (!selectedTableId || !isOnline) {
                setActiveOrderId(null)
                setExistingItems([])
                setExistingTotal(0)
                setCart([])
                return;
            }
            try {
                const { getActiveTableOrder } = await import('@/server/actions/orders')
                const res = await getActiveTableOrder(selectedTableId)
                if (res.success && res.data) {
                    setActiveOrderId(res.data.id)
                    setExistingItems(res.data.items.map((i: any) => ({
                        name: i.menuItem.name,
                        quantity: i.quantity,
                        price: i.price
                    })))
                    setExistingTotal(res.data.totalAmount)
                } else {
                    setActiveOrderId(null)
                    setExistingItems([])
                    setExistingTotal(0)
                }
                setCart([])
            } catch (e) {}
        }
        loadActiveOrder()
    }, [selectedTableId, isOnline])

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
        const { createPosOrder } = await import('@/server/actions/orders')
        
        let remainingOrders = [...offlineOrders]
        
        for (const order of offlineOrders) {
            try {
                const res = await createPosOrder(order)
                if (res.success) {
                    // Remove successfully sent order from queue
                    remainingOrders = remainingOrders.filter(o => o.id !== order.id)
                }
            } catch (e) {
                // Keep it in queue if network still fails
                break; 
            }
        }
        
        setOfflineOrders(remainingOrders)
        localStorage.setItem('pos_offline_orders', JSON.stringify(remainingOrders))
    }
    
    
    // Filter menu items by selected category
    const displayItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.categoryId === selectedCategory)

    const addToCart = (item: any) => {
        // For simplicity in this demo POS, we just add the item directly. 
        // If addons are needed, a modal should pop up here in a full production app.
        const newItem: CartItem = {
            id: Math.random().toString(36).substring(7),
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            addons: []
        }
        setCart(prev => [...prev, newItem])
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

    const cartTotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalAmount = existingTotal + cartTotalAmount

    const handleSendOrder = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true)
        try {
            if (!isOnline) throw new Error("Offline")
            const { sendOrderToKitchen } = await import('@/server/actions/orders')
            const res = await sendOrderToKitchen({
                orderId: activeOrderId || undefined,
                branchId,
                tableId: selectedTableId,
                items: cart.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
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
            if (!isOnline) throw new Error("Offline")
            
            const { sendOrderToKitchen, checkoutOrder } = await import('@/server/actions/orders')
            
            let currentOrderId = activeOrderId

            // If there are unsent items in cart, send them first
            if (cart.length > 0) {
                const sendRes = await sendOrderToKitchen({
                    orderId: activeOrderId || undefined,
                    branchId,
                    tableId: selectedTableId,
                    items: cart.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
                })
                if (sendRes.success && sendRes.orderId) {
                    currentOrderId = sendRes.orderId
                } else {
                    throw new Error(sendRes.error || "Failed to save order")
                }
            }

            if (!currentOrderId) throw new Error("No active order to checkout")

            // Checkout
            const checkRes = await checkoutOrder(currentOrderId)
            if (checkRes.success && checkRes.order) {
                // Print receipt
                setReceiptData({
                    orderId: checkRes.order.id,
                    date: checkRes.order.createdAt || new Date(),
                    items: [
                        ...existingItems,
                        ...cart.map(c => ({ name: c.name, price: c.price, quantity: c.quantity }))
                    ],
                    totalAmount: checkRes.order.totalAmount,
                    taxAmount: checkRes.order.taxAmount,
                    finalAmount: checkRes.order.finalAmount
                })
                setTimeout(() => window.print(), 100)

                alert(`✅ ဘေလ်ရှင်းရန် အောင်မြင်ပါသည်! စုစုပေါင်း: ${checkRes.order.finalAmount} MMK`)
                setCart([])
                setExistingItems([])
                setExistingTotal(0)
                setActiveOrderId(null)
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
        <div className="flex h-full relative">
            <ReceiptPrinter data={receiptData} />
            {/* === ဘယ်ဘက်ခြမ်း: Menu Items & Categories === */}
            <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
                {/* Categories Banner */}
                <div className="p-4 bg-slate-900/50 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                        >
                            အားလုံး (All)
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items Grid */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 lg:pb-6 content-start">
                    {displayItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all flex flex-col group relative overflow-hidden active:scale-95"
                        >
                            {/* 🖼️ Hero Image */}
                            {item.imageUrl ? (
                                <div className="w-full h-40 bg-slate-800 relative">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                                </div>
                            ) : (
                                <div className="w-full h-32 bg-slate-800 flex items-center justify-center relative">
                                    <span className="text-slate-600 text-3xl">🍽️</span>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col justify-between -mt-6 relative z-10">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-2 drop-shadow-md">{item.name}</h3>
                                    <span className="text-3xs text-slate-400 mt-1 uppercase tracking-wider">{item.category?.name}</span>
                                </div>
                                <div className="mt-4 font-black text-orange-400 font-mono">
                                    {item.price.toLocaleString()} <span className="text-3xs text-slate-500 font-normal">MMK</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {displayItems.length === 0 && (
                        <div className="col-span-full h-40 flex items-center justify-center text-sm text-slate-500">
                            မီနူးများ မရှိသေးပါ
                        </div>
                    )}
                </div>
            </div>

            {/* === ညာဘက်ခြမ်း: Shopping Cart (Desktop Sidebar / Mobile Bottom Sheet) === */}
            <div className={`
                fixed inset-y-0 right-0 z-40 w-full md:w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
                ${isCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                md:relative md:z-0
            `}>
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-black text-slate-200 flex items-center gap-2">
                            <span className="text-orange-500">🛒</span> Current Order
                        </h2>
                        {/* Offline & Syncing Status Badges */}
                        <div className="flex items-center gap-2 mt-1">
                            {!isOnline && (
                                <span className="text-3xs font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center gap-1">
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
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400"
                    >
                        ✕
                    </button>
                </div>

                {/* Table Selector */}
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">စားပွဲ ရွေးချယ်ရန် (Table)</label>
                    <select 
                        value={selectedTableId || ''} 
                        onChange={(e) => setSelectedTableId(e.target.value || null)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-orange-500 transition-colors"
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
                        <div key={`exist-${index}`} className="bg-slate-900 border border-slate-700/50 rounded-xl p-3 flex justify-between gap-3 opacity-70">
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-300 leading-tight">{item.name}</h4>
                                <p className="text-xs font-mono text-slate-400 mt-1">{(item.price * item.quantity).toLocaleString()} MMK</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-8 text-center text-xs font-bold text-slate-400">Qty: {item.quantity}</span>
                            </div>
                        </div>
                    ))}
                    {/* New Items */}
                    {cart.map((item, index) => (
                        <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between gap-3 animate-in fade-in slide-in-from-right-4">
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-200 leading-tight">{item.name}</h4>
                                <p className="text-xs font-mono text-orange-400 mt-1">{(item.price * item.quantity).toLocaleString()} MMK</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg transition-colors">−</button>
                                    <span className="w-8 text-center text-xs font-bold text-slate-200">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg transition-colors">+</button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && existingItems.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60 min-h-[200px]">
                            <span className="text-5xl">🛒</span>
                            <p className="text-xs uppercase font-bold tracking-wider">ဘေလ်ရှင်းရန် မရှိသေးပါ</p>
                        </div>
                    )}
                </div>

                <div className="p-5 bg-slate-950 border-t border-slate-800 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 font-mono">
                            {totalAmount.toLocaleString()} MMK
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSendOrder}
                            disabled={cart.length === 0 || isSubmitting}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center"
                        >
                            👨‍🍳 အော်ဒါပို့မည်
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={(cart.length === 0 && !activeOrderId) || isSubmitting}
                            className="flex-[2] bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-sm font-black py-3 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Processing..." : "💸 ဘေလ်ရှင်းမည်"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile View Cart FAB */}
            {!isCartOpen && (
                <div className="md:hidden fixed bottom-6 left-6 right-6 z-30">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-black py-4 rounded-2xl shadow-2xl shadow-orange-500/30 flex justify-between items-center px-6"
                    >
                        <span className="flex items-center gap-2">🛒 <span>{cart.length} Items</span></span>
                        <span>{totalAmount.toLocaleString()} MMK</span>
                    </button>
                </div>
            )}
        </div>
    )
}
