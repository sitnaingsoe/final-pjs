'use client'

import React, { useState, useEffect, useRef } from 'react'
import { OrderStatus } from '../../prisma/generated/enums'
import { getOrders, updateOrderStatus } from '@/server/actions/orders'

// Optional: you can place a small ding.mp3 in the public folder.
// Since we might not have one, we can fallback to a native browser beep using AudioContext, 
// or point to a reliable public URL for a gentle notification sound.
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [soundEnabled, setSoundEnabled] = useState(false)
    const [isPolling, setIsPolling] = useState(true)
    const prevPendingCountRef = useRef(initialOrders.filter(o => o.status === OrderStatus.PENDING).length)

    // Poll for new orders every 5 seconds
    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            try {
                const res = await getOrders()
                if (res.success && res.data) {
                    const newOrders = res.data
                    const newPendingCount = newOrders.filter((o: any) => o.status === OrderStatus.PENDING).length

                    // Play sound if new pending orders arrived and sound is enabled
                    if (newPendingCount > prevPendingCountRef.current && soundEnabled) {
                        try {
                            const audio = new Audio(NOTIFICATION_SOUND)
                            audio.play().catch(e => console.error("Audio playback failed:", e))
                        } catch (e) {
                            console.error("Audio error:", e)
                        }
                    }

                    // Update refs and state
                    prevPendingCountRef.current = newPendingCount
                    setOrders(newOrders)
                }
            } catch (error) {
                console.error("Polling error:", error)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [isPolling, soundEnabled])

    // Optimistic UI Update function
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        // Optimistically update the UI immediately
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ))

        // Update ref if pending count drops because we moved it to COOKING
        if (newStatus !== OrderStatus.PENDING) {
            prevPendingCountRef.current = Math.max(0, prevPendingCountRef.current - 1)
        }

        // Send request to server
        const res = await updateOrderStatus(orderId, newStatus)
        if (!res.success) {
            // Revert if failed by refetching actual data
            alert('အော်ဒါပြောင်းလဲခြင်း မအောင်မြင်ပါ')
            const fallback = await getOrders()
            if (fallback.success && fallback.data) setOrders(fallback.data)
        }
    }

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING)
    const cookingOrders = orders.filter(o => o.status === OrderStatus.COOKING)
    const readyOrders = orders.filter(o => o.status === OrderStatus.READY)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <span className="text-black">🍳</span> မီးဖိုချောင် အော်ဒါဘုတ် (Kitchen Board)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">အော်ဒါအသစ်ဝင်လာလျှင် အလိုအလျောက် ပြသပေးပါမည်</p>
                </div>

                {/* Control Panel */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPolling(!isPolling)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isPolling ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                        {isPolling ? 'Auto-Refresh (On)' : 'Auto-Refresh (Off)'}
                    </button>

                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${soundEnabled ? 'bg-black/20 text-gray-800 border border-black/30' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}
                    >
                        <span>{soundEnabled ? '🔊' : '🔇'}</span>
                        {soundEnabled ? 'အသံဖွင့်ထားသည်' : 'အသံပိတ်ထားသည်'}
                    </button>
                </div>
            </div>

            {/* 3-Column Kanban Board Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ကော်လံ ၁ - စောင့်ဆိုင်းဆဲ (PENDING) */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200 min-h-[500px] flex flex-col">
                    <h3 className="font-black text-gray-800 mb-5 flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            စောင့်ဆိုင်းဆဲ (Pending)
                        </span>
                        <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg font-bold border border-gray-300">{pendingOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {pendingOrders.map(order => (
                            <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 hover:border-red-500/50 transition-colors shadow-lg shadow-black/20 group animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center border-b border-gray-200/50 pb-3">
                                    <span className="font-black text-sm text-gray-800">#Ord-{order.orderNumber}</span>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {/* မှာယူသည့် မီနူးပစ္စည်းများ */}
                                <div className="text-sm space-y-2">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="font-bold text-gray-700">
                                            <div className="flex justify-between">
                                                <span>• {item.menuItem.name}</span>
                                                <span className="text-red-600 font-black px-2 bg-red-500/10 rounded">x{item.quantity}</span>
                                            </div>
                                            {item.addons.map((a: any) => (
                                                <div key={a.id} className="text-xs text-gray-400 pl-4 mt-0.5">↳ {a.addon.name}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <div className="text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-300 italic font-medium">📝 {order.notes}</div>}

                                <button onClick={() => handleStatusChange(order.id, OrderStatus.COOKING)} className="w-full bg-gray-200 hover:bg-red-500 hover:text-black text-gray-700 text-xs font-black py-3 rounded-lg transition-all border border-gray-300 hover:border-red-500 flex justify-center items-center gap-2">
                                    👨‍🍳 လက်ခံပြီး ချက်ပြုတ်မည်
                                </button>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
                                <span className="text-4xl">📥</span>
                                <span className="text-xs font-bold">အော်ဒါအသစ်မရှိပါ</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ကော်လံ ၂ - ချက်ပြုတ်ဆဲ (COOKING) */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200 min-h-[500px] flex flex-col">
                    <h3 className="font-black text-gray-800 mb-5 flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            ချက်ပြုတ်ဆဲ (Cooking)
                        </span>
                        <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg font-bold border border-gray-300">{cookingOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {cookingOrders.map(order => (
                            <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 hover:border-blue-500/50 transition-colors shadow-lg shadow-black/20 group animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center border-b border-gray-200/50 pb-3">
                                    <span className="font-black text-sm text-gray-800">#Ord-{order.orderNumber}</span>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm space-y-2">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="font-bold text-gray-700">
                                            <div className="flex justify-between">
                                                <span>• {item.menuItem.name}</span>
                                                <span className="text-blue-400 font-black px-2 bg-blue-500/10 rounded">x{item.quantity}</span>
                                            </div>
                                            {item.addons.map((a: any) => (
                                                <div key={a.id} className="text-xs text-gray-400 pl-4 mt-0.5">↳ {a.addon.name}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <div className="text-xs bg-gray-50 p-3 rounded-lg text-gray-500 italic">📝 {order.notes}</div>}

                                <button onClick={() => handleStatusChange(order.id, OrderStatus.READY)} className="w-full bg-gray-200 hover:bg-blue-500 hover:text-black text-gray-700 text-xs font-black py-3 rounded-lg transition-all border border-gray-300 hover:border-blue-500 flex justify-center items-center gap-2">
                                    ✅ ချက်ပြုတ်ပြီး (ပွဲထွက်မည်)
                                </button>
                            </div>
                        ))}
                        {cookingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
                                <span className="text-4xl">🔥</span>
                                <span className="text-xs font-bold">ချက်ပြုတ်နေသော အော်ဒါမရှိပါ</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ကော်လံ ၃ - အဆင်သင့်ဖြစ်ပြီ (READY) */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200 min-h-[500px] flex flex-col">
                    <h3 className="font-black text-gray-800 mb-5 flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            ပွဲထွက်ရန် (Ready)
                        </span>
                        <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg font-bold border border-gray-300">{readyOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {readyOrders.map(order => (
                            <div key={order.id} className="bg-white p-5 rounded-xl border border-green-500/30 space-y-4 shadow-lg shadow-green-500/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/20 to-transparent"></div>
                                <div className="flex justify-between items-center border-b border-gray-200/50 pb-3 relative z-10">
                                    <span className="font-black text-sm text-gray-800">#Ord-{order.orderNumber}</span>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm space-y-2 relative z-10">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="font-bold text-gray-700">
                                            <div className="flex justify-between">
                                                <span>• {item.menuItem.name}</span>
                                                <span className="text-green-600 font-black px-2 bg-green-500/10 rounded">x{item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200/50 flex justify-between items-center relative z-10">
                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                        ✨ အသင့်ဖြစ်ပါပြီ
                                    </span>
                                    <button onClick={() => handleStatusChange(order.id, OrderStatus.DELIVERED)} className="bg-gray-200 hover:bg-green-500 hover:text-black text-gray-500 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-gray-300 hover:border-green-500">
                                        ရှင်းမည်
                                    </button>
                                </div>
                            </div>
                        ))}
                        {readyOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
                                <span className="text-4xl">🛎️</span>
                                <span className="text-xs font-bold">အဆင်သင့်ဖြစ်သော အော်ဒါမရှိပါ</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
