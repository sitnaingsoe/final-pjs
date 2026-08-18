'use client'

import React, { useState, useEffect, useRef } from 'react'
import { OrderStatus } from '../../prisma/generated/enums'
import { getOrders, updateOrderItemsStatus } from '@/server/actions/orders'

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [soundEnabled, setSoundEnabled] = useState(false)
    const [isPolling, setIsPolling] = useState(true)
    const prevPendingCountRef = useRef(initialOrders.filter(o => o.status === OrderStatus.PENDING).length)

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            try {
                const res = await getOrders()
                if (res.success && res.data) {
                    const newOrders = res.data
                    const newPendingCount = newOrders.filter((o: any) => o.status === OrderStatus.PENDING).length

                    if (newPendingCount > prevPendingCountRef.current && soundEnabled) {
                        try {
                            const audio = new Audio(NOTIFICATION_SOUND)
                            audio.play().catch(e => console.error("Audio playback failed:", e))
                        } catch (e) {
                            console.error("Audio error:", e)
                        }
                    }

                    prevPendingCountRef.current = newPendingCount
                    setOrders(newOrders)
                }
            } catch (error: any) {
                console.error("Polling error:", error)
                if (error?.message?.includes('unexpected response') || error?.message?.includes('Unexpected token')) {
                    window.location.href = '/login?error=session_expired'
                }
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [isPolling, soundEnabled])

    const handleStatusChange = async (orderId: string, currentStatus: string, newStatus: string) => {
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                return {
                    ...order,
                    items: (order.items as any[]).map(item => 
                        (item.status || 'PENDING') === currentStatus ? { ...item, status: newStatus } : item
                    )
                }
            }
            return order
        }))

        const res = await updateOrderItemsStatus(orderId, currentStatus, newStatus)
        if (!res.success) {
            alert('အော်ဒါပြောင်းလဲခြင်း မအောင်မြင်ပါ')
            const fallback = await getOrders()
            if (fallback.success && fallback.data) setOrders(fallback.data)
        }
    }

    const pendingOrders = orders.filter(o => (o.items as any[]).some(i => (i.status || 'PENDING') === OrderStatus.PENDING))
    const cookingOrders = orders.filter(o => (o.items as any[]).some(i => (i.status || 'PENDING') === OrderStatus.COOKING))
    const readyOrders = orders.filter(o => (o.items as any[]).some(i => (i.status || 'PENDING') === OrderStatus.READY))

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 glass rounded-[2rem] border border-border/50 shadow-2xl relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Kitchen Board</h1>
                        <p className="text-[10px] md:text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">မီးဖိုချောင် အော်ဒါဘုတ်</p>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="flex flex-wrap items-center gap-3">
                    <a 
                        href="/kitchen" 
                        target="_blank" 
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-[10px] uppercase tracking-widest font-black transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                        Full KDS
                    </a>
                    
                    <button
                        onClick={() => setIsPolling(!isPolling)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all shadow-sm ${isPolling ? 'bg-card text-foreground border border-border hover:shadow-md' : 'bg-muted/50 text-muted-foreground border border-border/50'}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-primary animate-pulse' : 'bg-muted-foreground/50'}`}></span>
                        {isPolling ? 'Auto-Refresh (On)' : 'Auto-Refresh (Off)'}
                    </button>

                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all shadow-sm ${soundEnabled ? 'bg-card text-foreground border border-border hover:shadow-md' : 'bg-muted/50 text-muted-foreground border border-border/50'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {soundEnabled ? (
                                <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>
                            ) : (
                                <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
                            )}
                        </svg>
                        {soundEnabled ? 'Sound On' : 'Sound Off'}
                    </button>
                </div>
            </div>

            {/* 3-Column Kanban Board Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* ကော်လံ ၁ - စောင့်ဆိုင်းဆဲ (PENDING) */}
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg min-h-[500px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <h3 className="font-black text-foreground mb-6 flex justify-between items-center pb-4 border-b border-border/50 relative z-10">
                        <span className="flex items-center gap-2 uppercase tracking-wider text-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)]"></span>
                            Pending <span className="text-[10px] font-bold text-muted-foreground ml-1 tracking-normal">(စောင့်ဆိုင်းဆဲ)</span>
                        </span>
                        <span className="bg-muted text-foreground text-[10px] px-3 py-1 rounded-md font-black font-mono border border-border/50">{pendingOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {pendingOrders.map(order => (
                            <div key={order.id} className="bg-card p-5 rounded-2xl border border-border/50 space-y-4 hover:border-orange-500/50 hover:shadow-lg transition-all duration-300 relative group/card">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-muted/50 to-transparent rounded-tr-2xl"></div>
                                <div className="flex justify-between items-center border-b border-border/50 pb-3 relative z-10">
                                    <span className="font-black text-sm text-foreground uppercase tracking-wider">{order.table ? `Table ${order.table.number}` : "Takeaway"}</span>
                                    <span className="text-[10px] font-black font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/50">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm space-y-2 relative z-10">
                                    {order.items.filter((item: any) => (item.status || 'PENDING') === OrderStatus.PENDING).map((item: any, idx: number) => (
                                        <div key={'item-' + idx} className="font-bold text-foreground">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs uppercase tracking-wide leading-tight mt-0.5">• {item.name || item.menuItem?.name || "Unknown Item"}</span>
                                                <span className="text-foreground font-black text-xs px-2 py-0.5 bg-muted border border-border/50 rounded-md shrink-0">x{item.quantity}</span>
                                            </div>
                                            {item.addons?.map((a: any, idx: number) => (
                                                <div key={'addon-' + idx} className="text-[10px] text-muted-foreground pl-4 mt-1 font-semibold">↳ {a.name || a.addon?.name || "Addon"}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <div className="text-[10px] bg-muted/50 border border-border p-3 rounded-xl text-muted-foreground font-bold uppercase tracking-widest relative z-10"><span className="mr-1">📝</span> {order.notes}</div>}

                                <button onClick={() => handleStatusChange(order.id, OrderStatus.PENDING, OrderStatus.COOKING)} className="w-full bg-card hover:bg-primary text-foreground hover:text-primary-foreground text-[10px] uppercase tracking-widest font-black py-3.5 rounded-xl transition-all border border-border shadow-sm hover:shadow-md flex justify-center items-center gap-2 relative z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Start Cooking
                                </button>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">No Pending Orders</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ကော်လံ ၂ - ချက်ပြုတ်ဆဲ (COOKING) */}
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg min-h-[500px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h3 className="font-black text-foreground mb-6 flex justify-between items-center pb-4 border-b border-border/50 relative z-10">
                        <span className="flex items-center gap-2 uppercase tracking-wider text-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
                            Cooking <span className="text-[10px] font-bold text-muted-foreground ml-1 tracking-normal">(ချက်ပြုတ်ဆဲ)</span>
                        </span>
                        <span className="bg-muted text-foreground text-[10px] px-3 py-1 rounded-md font-black font-mono border border-border/50">{cookingOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {cookingOrders.map(order => (
                            <div key={order.id} className="bg-card p-5 rounded-2xl border border-border/50 space-y-4 hover:border-orange-500/50 hover:shadow-lg transition-all duration-300 relative group/card">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-tr-2xl"></div>
                                <div className="flex justify-between items-center border-b border-border/50 pb-3 relative z-10">
                                    <span className="font-black text-sm text-foreground uppercase tracking-wider">{order.table ? `Table ${order.table.number}` : "Takeaway"}</span>
                                    <span className="text-[10px] font-black font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/50">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm space-y-2 relative z-10">
                                    {order.items.filter((item: any) => (item.status || 'PENDING') === OrderStatus.COOKING).map((item: any, idx: number) => (
                                        <div key={'item-' + idx} className="font-bold text-foreground">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs uppercase tracking-wide leading-tight mt-0.5">• {item.name || item.menuItem?.name || "Unknown Item"}</span>
                                                <span className="text-foreground font-black text-xs px-2 py-0.5 bg-muted border border-border/50 rounded-md shrink-0">x{item.quantity}</span>
                                            </div>
                                            {item.addons?.map((a: any, idx: number) => (
                                                <div key={'addon-' + idx} className="text-[10px] text-muted-foreground pl-4 mt-1 font-semibold">↳ {a.name || a.addon?.name || "Addon"}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <div className="text-[10px] bg-muted/50 border border-border p-3 rounded-xl text-muted-foreground font-bold uppercase tracking-widest relative z-10"><span className="mr-1">📝</span> {order.notes}</div>}

                                <button onClick={() => handleStatusChange(order.id, OrderStatus.COOKING, OrderStatus.READY)} className="w-full bg-primary hover:opacity-90 text-primary-foreground text-[10px] uppercase tracking-widest font-black py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 flex justify-center items-center gap-2 relative z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    Mark as Ready
                                </button>
                            </div>
                        ))}
                        {cookingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">No Cooking Orders</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ကော်လံ ၃ - အဆင်သင့်ဖြစ်ပြီ (READY) */}
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg min-h-[500px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h3 className="font-black text-foreground mb-6 flex justify-between items-center pb-4 border-b border-border/50 relative z-10">
                        <span className="flex items-center gap-2 uppercase tracking-wider text-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            Ready <span className="text-[10px] font-bold text-muted-foreground ml-1 tracking-normal">(ပွဲထွက်ရန်)</span>
                        </span>
                        <span className="bg-muted text-foreground text-[10px] px-3 py-1 rounded-md font-black font-mono border border-border/50">{readyOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {readyOrders.map(order => (
                            <div key={order.id} className="bg-card p-5 rounded-2xl border border-border/50 space-y-4 hover:border-orange-500/50 hover:shadow-lg transition-all relative overflow-hidden group/card">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-transparent rounded-tr-2xl"></div>
                                <div className="flex justify-between items-center border-b border-border/50 pb-3 relative z-10">
                                    <span className="font-black text-sm text-foreground uppercase tracking-wider">{order.table ? `Table ${order.table.number}` : "Takeaway"}</span>
                                    <span className="text-[10px] font-black font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/50">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm space-y-2 relative z-10">
                                    {order.items.filter((item: any) => (item.status || 'PENDING') === OrderStatus.READY).map((item: any, idx: number) => (
                                        <div key={'item-' + idx} className="font-bold text-foreground">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs uppercase tracking-wide leading-tight mt-0.5">• {item.name || item.menuItem?.name || "Unknown Item"}</span>
                                                <span className="text-green-500 font-black text-xs px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md shrink-0">x{item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 pt-4 border-t border-border/50 flex justify-between items-center relative z-10">
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        Ready
                                    </span>
                                    <button onClick={() => handleStatusChange(order.id, OrderStatus.READY, OrderStatus.DELIVERED)} className="bg-card hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border border-border shadow-sm hover:shadow-md">
                                        Clear
                                    </button>
                                </div>
                            </div>
                        ))}
                        {readyOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">No Ready Orders</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
