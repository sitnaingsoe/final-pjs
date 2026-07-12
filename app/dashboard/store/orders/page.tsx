// app/(dashboard)/orders/page.tsx
import React from 'react'
import { getOrders, updateOrderStatus } from '@/server/actions/orders'
import { OrderStatus } from '../../../../prisma/generated/enums'

export default async function OrdersPage() {
    const result = await getOrders()
    const orders = result.data || []

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING)
    const cookingOrders = orders.filter(o => o.status === OrderStatus.COOKING)
    const readyOrders = orders.filter(o => o.status === OrderStatus.READY)

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        'use server'
        await updateOrderStatus(orderId, status)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                    <span className="text-orange-500">🍳</span> မီးဖိုချောင် အော်ဒါဘုတ် (Kitchen Board)
                </h2>
                <p className="text-sm text-slate-400 mt-1">ဝင်လာသော အော်ဒါများကို ဤနေရာမှ တိုက်ရိုက် စီမံခန့်ခွဲနိုင်ပါသည်</p>
            </div>

            {/* 3-Column Kanban Board Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ကော်လံ ၁ - စောင့်ဆိုင်းဆဲ (PENDING) */}
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 min-h-[500px] flex flex-col">
                    <h3 className="font-black text-slate-200 mb-5 flex justify-between items-center pb-3 border-b border-slate-800">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            စောင့်ဆိုင်းဆဲ (Pending)
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-lg font-bold border border-slate-700">{pendingOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {pendingOrders.map(order => (
                            <div key={order.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 hover:border-red-500/50 transition-colors shadow-lg shadow-black/20 group">
                                <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                                    <span className="font-black text-sm text-slate-200">#Ord-{order.orderNumber}</span>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {/* မှာယူသည့် မီနူးပစ္စည်းများ */}
                                <div className="text-sm space-y-2">
                                    {order.items.map(item => (
                                        <div key={item.id} className="font-bold text-slate-300">
                                            <div className="flex justify-between">
                                                <span>• {item.menuItem.name}</span>
                                                <span className="text-red-400 font-black px-2 bg-red-500/10 rounded">x{item.quantity}</span>
                                            </div>
                                            {item.addons.map(a => (
                                                <div key={a.id} className="text-xs text-slate-500 pl-4 mt-0.5">↳ {a.addon.name}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <div className="text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-300 italic font-medium">📝 {order.notes}</div>}

                                {/* လုပ်ဆောင်ချက် ခလုတ် */}
                                <form action={handleStatusChange.bind(null, order.id, OrderStatus.COOKING)}>
                                    <button type="submit" className="w-full bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 text-xs font-black py-3 rounded-lg transition-all border border-slate-700 hover:border-red-500 flex justify-center items-center gap-2">
                                        👨‍🍳 လက်ခံပြီး ချက်ပြုတ်မည်
                                    </button>
                                </form>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 space-y-2">
                                <span className="text-4xl">📥</span>
                                <span className="text-xs font-bold">အော်ဒါအသစ်မရှိပါ</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ကော်လံ ၂ - ချက်ပြုတ်ဆဲ (COOKING) */}
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 min-h-[500px] flex flex-col">
                    <h3 className="font-black text-slate-200 mb-5 flex justify-between items-center pb-3 border-b border-slate-800">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            ချက်ပြုတ်ဆဲ (Cooking)
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-lg font-bold border border-slate-700">{cookingOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {cookingOrders.map(order => (
                            <div key={order.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 hover:border-blue-500/50 transition-colors shadow-lg shadow-black/20 group">
                                <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                                    <span className="font-black text-sm text-slate-200">#Ord-{order.orderNumber}</span>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm space-y-2">
                                    {order.items.map(item => (
                                        <div key={item.id} className="font-bold text-slate-300">
                                            <div className="flex justify-between">
                                                <span>• {item.menuItem.name}</span>
                                                <span className="text-blue-400 font-black px-2 bg-blue-500/10 rounded">x{item.quantity}</span>
                                            </div>
                                            {item.addons.map(a => (
                                                <div key={a.id} className="text-xs text-slate-500 pl-4 mt-0.5">↳ {a.addon.name}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <div className="text-xs bg-slate-900 p-3 rounded-lg text-slate-400 italic">📝 {order.notes}</div>}

                                <form action={handleStatusChange.bind(null, order.id, OrderStatus.READY)}>
                                    <button type="submit" className="w-full bg-slate-800 hover:bg-blue-500 hover:text-white text-slate-300 text-xs font-black py-3 rounded-lg transition-all border border-slate-700 hover:border-blue-500 flex justify-center items-center gap-2">
                                        ✅ ချက်ပြုတ်ပြီး (ပွဲထွက်မည်)
                                    </button>
                                </form>
                            </div>
                        ))}
                        {cookingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 space-y-2">
                                <span className="text-4xl">🔥</span>
                                <span className="text-xs font-bold">ချက်ပြုတ်နေသော အော်ဒါမရှိပါ</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ကော်လံ ၃ - အဆင်သင့်ဖြစ်ပြီ (READY) */}
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 min-h-[500px] flex flex-col">
                    <h3 className="font-black text-slate-200 mb-5 flex justify-between items-center pb-3 border-b border-slate-800">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            ပွဲထွက်ရန် (Ready)
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-lg font-bold border border-slate-700">{readyOrders.length}</span>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {readyOrders.map(order => (
                            <div key={order.id} className="bg-slate-950 p-5 rounded-xl border border-green-500/30 space-y-4 shadow-lg shadow-green-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/20 to-transparent"></div>
                                <div className="flex justify-between items-center border-b border-slate-800/50 pb-3 relative z-10">
                                    <span className="font-black text-sm text-slate-200">#Ord-{order.orderNumber}</span>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm space-y-2 relative z-10">
                                    {order.items.map(item => (
                                        <div key={item.id} className="font-bold text-slate-300">
                                            <div className="flex justify-between">
                                                <span>• {item.menuItem.name}</span>
                                                <span className="text-green-400 font-black px-2 bg-green-500/10 rounded">x{item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center relative z-10">
                                    <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                                        ✨ အသင့်ဖြစ်ပါပြီ
                                    </span>
                                    <form action={handleStatusChange.bind(null, order.id, OrderStatus.COMPLETED)}>
                                        <button type="submit" className="bg-slate-800 hover:bg-green-500 hover:text-white text-slate-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-slate-700 hover:border-green-500">
                                            ရှင်းမည်
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                        {readyOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 space-y-2">
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