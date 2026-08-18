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
    const [tablesList, setTablesList] = useState<any[]>(tables)

    // Sync tables prop when updated from parent
    useEffect(() => {
        setTablesList(tables)
    }, [tables])

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

    // 🔥 LIVE POLLING (4 Seconds): Fetch pending bill requests & live table statuses
    useEffect(() => {
        if (!isOnline) return;

        const fetchRequests = async () => {
            try {
                const { getPendingBillRequests } = await import('@/server/actions/orders')
                const { getTables } = await import('@/server/actions/tables')

                const [billRes, tablesRes] = await Promise.all([
                    getPendingBillRequests(branchId),
                    getTables()
                ])

                if (billRes.success && billRes.data) {
                    setBillRequests(billRes.data)
                }
                if (tablesRes.success && tablesRes.data) {
                    setTablesList(tablesRes.data)
                }
            } catch (e: any) {
                if (e?.message?.includes('unexpected response') || e?.message?.includes('Unexpected token')) {
                    window.location.href = '/login?error=session_expired'
                }
            }
        }
        
        fetchRequests()
        const intervalId = setInterval(fetchRequests, 4000)
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
    
    
    const [searchQuery, setSearchQuery] = useState('')

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 8

    // Reset pagination to page 1 whenever category or search query changes
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCategory, searchQuery])

    // Filter menu items by selected category and search query
    const displayItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory
        const matchesSearch = searchQuery.trim() === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const totalPages = Math.ceil(displayItems.length / ITEMS_PER_PAGE) || 1
    const paginatedItems = displayItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
        if (item.isActive === false) {
            alert(`"${item.name}" မှာ ခေတ္တ ကုန်နေပါသဖြင့် မှာယူ၍ မရပါ (Out of Stock)`)
            return
        }
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

    const handlePrintReceipt = async () => {
        // Trigger checkout which marks PAID in DB, prints receipt, and clears cart
        await handleCheckout()
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
                const selectedTableObj = tablesList.find(t => t.id === selectedTableId)
                const tableLabel = selectedTableObj ? `Table ${selectedTableObj.number}` : 'TAKEAWAY / POS'

                // Print receipt
                setReceiptData({
                    orderId: checkRes.order.id,
                    tableNumber: tableLabel,
                    date: checkRes.order.createdAt || new Date(),
                    items: [
                        ...existingItems.map(c => ({
                            name: c.name,
                            price: c.price,
                            quantity: c.quantity,
                            addons: c.addons
                        })),
                        ...cart.map(c => ({ 
                            name: c.name, 
                            price: c.price, 
                            quantity: c.quantity,
                            addons: c.addons
                        }))
                    ],
                    totalAmount: checkRes.order.totalAmount,
                    taxAmount: checkRes.order.taxAmount,
                    discountAmount: appliedPromo?.amount || 0,
                    promoCode: appliedPromo?.code || undefined,
                    finalAmount: checkRes.order.finalAmount,
                    paperSize: '80mm'
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
                            <div key={req.id} className="bg-destructive text-destructive-foreground p-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-4 border border-destructive/20">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl origin-top animate-[wiggle_1s_ease-in-out_infinite]">🔔</span>
                                    <div className="leading-tight">
                                        <p className="font-bold text-sm">ဘေလ်တောင်းထားသည်</p>
                                        <p className="text-xs text-destructive-foreground/80 mt-0.5">စားပွဲ {req.table?.number}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedTableId(req.tableId)
                                        if (window.innerWidth < 768) setIsCartOpen(true)
                                    }}
                                    className="bg-background text-foreground px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-secondary active:scale-[0.98] transition-all"
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
                    {/* 🔍 Search & Categories Bar */}
                    <div className="p-4 bg-background border-b border-border/50 shrink-0 space-y-4">
                        {/* Search Input Bar */}
                        <div className="relative w-full max-w-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ဟင်းပွဲအမည် ဖြင့် ရှာဖွေပါ (Search menu items...)"
                                className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-medium text-xs p-1"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Category Scrollable Pills */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1 ">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                <span>🍽️ အားလုံး</span>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-colors ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {menuItems.length}
                                </span>
                            </button>
                            {categories.map(cat => {
                                const catCount = menuItems.filter(i => i.categoryId === cat.id).length
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <span>{cat.name}</span>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-colors ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {catCount}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                {/* 🍱 Premium Lookable Menu Items Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 flex flex-col justify-between bg-background/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
                        {paginatedItems.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => handleItemClick(item)} 
                                className={`group bg-white rounded-2xl border border-slate-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
                                    item.isActive !== false 
                                        ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]' 
                                        : 'opacity-70 cursor-not-allowed bg-slate-50'
                                }`}
                            >
                                {/* OUT OF STOCK Badge Overlay */}
                                {item.isActive === false && (
                                    <div className="absolute top-3 right-3 backdrop-blur-md bg-rose-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-20 shadow-sm uppercase tracking-wider">
                                        OUT OF STOCK
                                    </div>
                                )}

                                {/* Red Discount Tag */}
                                {item.discount && item.discount.isActive && item.isActive !== false && (
                                    <div className="absolute top-3 left-3 backdrop-blur-md bg-rose-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-20 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🔥</span>
                                        <span>{item.discount.type === 'PERCENTAGE' ? `-${item.discount.value}%` : `-${item.discount.value.toLocaleString()} MMK`}</span>
                                    </div>
                                )}

                                {/* 🖼️ Hero Image Container */}
                                {item.imageUrl ? (
                                    <div className="w-full h-44 bg-slate-100 relative overflow-hidden rounded-t-2xl border-b border-slate-100">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 50vw, 25vw" />
                                    </div>
                                ) : (
                                    <div className="w-full h-40 bg-secondary flex items-center justify-center relative overflow-hidden border-b border-border/10">
                                        <span className="text-muted-foreground text-4xl group-hover:scale-105 transition-transform duration-300">🍽️</span>
                                    </div>
                                )}

                                {/* Item Details */}
                                <div className="p-4 flex-1 flex flex-col justify-between relative z-10 bg-transparent">
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-base font-semibold text-slate-800 line-clamp-1">
                                                {item.name}
                                            </h3>
                                            {item.addonCategories && item.addonCategories.length > 0 && (
                                                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full shrink-0">
                                                    +Addon
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">
                                            {item.category?.name || 'General'}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block leading-none mb-1">Price</span>
                                            {item.discount && item.discount.isActive ? (
                                                <div className="flex items-baseline">
                                                    <span className="text-base font-bold text-orange-600">
                                                        {getFinalPrice(item).toLocaleString()} <span className="text-xs">MMK</span>
                                                    </span>
                                                    <span className="text-xs text-slate-400 line-through ml-1.5">
                                                        {item.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-base font-bold text-orange-600">
                                                    {item.price.toLocaleString()} <span className="text-xs text-orange-600/70">MMK</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Add Button Icon */}
                                        <button className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${item.isActive !== false ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {displayItems.length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center text-center bg-card rounded-xl border border-border/50 p-8 shadow-sm my-auto">
                            <span className="text-4xl mb-3 opacity-40">🔍</span>
                            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">
                                မီနူး ရှာမတွေ့ပါ
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                ရှာဖွေမှု စာလုံး သို့မဟုတ် ကက်တဂိုရီကို အခြားတစ်ခု ပြောင်းကြည့်ပါခင်ဗျာ။
                            </p>
                        </div>
                    )}

                    {/* 📄 Pagination Bar */}
                    {displayItems.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 px-2 border-t border-slate-200/80 mt-6 shrink-0">
                            <div className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-800">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, displayItems.length)}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, displayItems.length)}</span> of <span className="font-bold text-slate-800">{displayItems.length}</span> items
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        ‹ Prev
                                    </button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                currentPage === page
                                                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        Next ›
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* === ညာဘက်ခြမ်း: Shopping Cart (Desktop Sidebar / Mobile Bottom Sheet) === */}
            <div className={`
                fixed inset-y-0 right-0 z-40 w-full md:w-[420px] flex flex-col transition-transform duration-300 ease-in-out md:p-4 lg:p-6 bg-slate-50/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none
                ${isCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                md:relative md:z-0
            `}>
                <div className="bg-white md:rounded-2xl border-l md:border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-transparent shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span className="text-xl">🛒</span> Current Order
                        </h2>
                        {isBillRequested && (
                            <span className="text-[10px] bg-destructive/10 text-destructive font-bold px-3 py-1.5 rounded-full animate-pulse mt-2 mb-1 inline-block text-center border border-destructive/20">
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
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Table Selector */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">စားပွဲ ရွေးချယ်ရန် (Table)</label>
                    <select 
                        value={selectedTableId || ''} 
                        onChange={(e) => setSelectedTableId(e.target.value || null)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm cursor-pointer"
                    >
                        <option value="">ပါဆယ် (Takeaway)</option>
                        {tablesList.map(table => (
                            <option key={table.id} value={table.id}>
                                စားပွဲ {table.number}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50 custom-scrollbar">
                    {/* Existing Items */}
                    {existingItems.map((item, index) => (
                        <div key={`exist-${index}`} className="bg-secondary/40 border border-border/50 rounded-3xl p-4 flex justify-between gap-3 opacity-80 backdrop-blur-sm">
                            <div className="flex-1">
                                <h4 className="text-[15px] font-semibold text-foreground leading-tight">{item.name}</h4>
                                {item.addons && item.addons.length > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                                        {item.addons.map((a: any) => a.name).join(', ')}
                                    </p>
                                )}
                                <p className="text-sm font-medium text-muted-foreground mt-1.5">{(item.price * item.quantity).toLocaleString()} MMK</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-8 text-center text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-lg">x{item.quantity}</span>
                            </div>
                        </div>
                    ))}
                    {/* New Items */}
                    {cart.map((item, index) => (
                        <div key={item.id} className="bg-card border border-border/50 rounded-3xl p-4 flex justify-between gap-3 animate-in fade-in slide-in-from-right-4 soft-shadow">
                            <div className="flex-1">
                                <h4 className="text-[15px] font-semibold text-foreground leading-tight">{item.name}</h4>
                                {item.addons && item.addons.length > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                                        {item.addons.map(a => a.name).join(', ')}
                                    </p>
                                )}
                                <p className="text-sm font-semibold text-primary mt-1.5">{(item.price * item.quantity).toLocaleString()} MMK</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-secondary/50 rounded-2xl p-1">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-xl transition-all text-lg shadow-sm">−</button>
                                    <span className="w-8 text-center text-[13px] font-bold text-foreground">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-xl transition-all text-lg shadow-sm">+</button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-2xl transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
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
                <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
                    {appliedPromo ? (
                        <div className="flex justify-between items-center bg-orange-50 text-orange-600 px-5 py-3 rounded-xl border border-orange-200">
                            <span className="font-semibold text-sm flex items-center gap-2">🎟️ Promo Applied: {appliedPromo.code}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-bold">-{appliedPromo.amount.toLocaleString()} MMK</span>
                                <button onClick={() => setAppliedPromo(null)} className="text-orange-600 hover:text-orange-800 font-bold text-sm bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center">✕</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <input 
                                    type="text" 
                                    placeholder="Enter Promo Code" 
                                    value={promoCodeInput}
                                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                    className="flex-1 bg-white border-none px-4 py-3 text-sm font-medium uppercase outline-none text-slate-800 placeholder:text-slate-400"
                                />
                                <button 
                                    onClick={handleApplyPromo}
                                    disabled={!promoCodeInput || isSubmitting}
                                    className="bg-slate-900 hover:bg-black text-white px-6 py-3 text-sm font-bold transition-all disabled:opacity-50 disabled:bg-slate-300"
                                >
                                    Apply
                                </button>
                            </div>
                            {promoError && <p className="text-rose-500 text-xs font-bold mt-2 ml-2">{promoError}</p>}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-5">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total</span>
                        <span className="text-3xl font-bold text-slate-900 tracking-tight">
                            {totalAmount.toLocaleString()} <span className="text-lg text-slate-500">MMK</span>
                        </span>
                    </div>
                    <div className="flex gap-3 mb-3">
                        <button
                            onClick={handlePrintReceipt}
                            disabled={(cart.length === 0 && existingItems.length === 0) || isSubmitting}
                            className="flex-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Print Thermal Receipt"
                        >
                            🖨️ ဘေလ်ရိုက်မည်
                        </button>
                        <button
                            onClick={handleSendOrder}
                            disabled={(cart.length === 0 || isSubmitting) ? true : undefined}
                            className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 text-slate-800 text-xs font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                        >
                            👨‍🍳 အော်ဒါပို့မည်
                        </button>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={((cart.length === 0 && !activeOrderId) || isSubmitting) ? true : undefined}
                        className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:bg-slate-300 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? "..." : "💸 ရှင်းမည်"}
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
