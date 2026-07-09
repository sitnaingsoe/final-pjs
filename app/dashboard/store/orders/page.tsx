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
                <h2 className="text-xl font-bold text-gray-800">မီးဖိုချောင် အော်ဒါဘုတ် (Kitchen Order Board)</h2>
                <p className="text-sm text-gray-500">ဝင်လာသော အော်ဒါများကို ဤနေရာမှ တိုက်ရိုက် စီမံခန့်ခွဲနိုင်ပါသည်</p>
            </div>

            {/* 3-Column Kanban Board Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ကော်လံ ၁ - စောင့်ဆိုင်းဆဲ (PENDING) */}
                <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-100 min-h-[500px]">
                    <h3 className="font-bold text-orange-700 mb-4 flex justify-between items-center">
                        <span>📥 စောင့်ဆိုင်းဆဲ (Pending)</span>
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
                    </h3>
                    <div className="space-y-4">
                        {pendingOrders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-bold text-sm text-gray-700">#Ord-{order.orderNumber}</span>
                                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {/* မှာယူသည့် မီနူးပစ္စည်းများ */}
                                <div className="text-sm space-y-1">
                                    {order.items.map(item => (
                                        <div key={item.id} className="font-medium">
                                            • {item.menuItem.name} <span className="text-orange-600 font-bold">x{item.quantity}</span>
                                            {item.addons.map(a => (
                                                <div key={a.id} className="text-xs text-gray-400 pl-4">+ {a.addon.name}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <div className="text-xs bg-gray-50 p-2 rounded text-gray-500 italic">📝 {order.notes}</div>}

                                {/* လုပ်ဆောင်ချက် ခလုတ် */}
                                <form action={handleStatusChange.bind(null, order.id, OrderStatus.COOKING)}>
                                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded transition">
                                        👨‍🍳 လက်ခံပြီး ချက်ပြုတ်မည်
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ကော်လံ ၂ - ချက်ပြုတ်ဆဲ (COOKING) */}
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 min-h-[500px]">
                    <h3 className="font-bold text-blue-700 mb-4 flex justify-between items-center">
                        <span>🔥 ချက်ပြုတ်ဆဲ (Cooking)</span>
                        <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">{cookingOrders.length}</span>
                    </h3>
                    <div className="space-y-4">
                        {cookingOrders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-bold text-sm text-gray-700">#Ord-{order.orderNumber}</span>
                                </div>
                                <div className="text-sm space-y-1">
                                    {order.items.map(item => (
                                        <div key={item.id} className="font-medium">
                                            • {item.menuItem.name} <span className="text-blue-600 font-bold">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <form action={handleStatusChange.bind(null, order.id, OrderStatus.READY)}>
                                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded transition">
                                        ✅ ချက်ပြုတ်ပြီး (ပွဲထွက်မည်)
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ကော်လံ ၃ - အဆင်သင့်ဖြစ်ပြီ (READY) */}
                <div className="bg-green-50/60 p-4 rounded-xl border border-green-100 min-h-[500px]">
                    <h3 className="font-bold text-green-700 mb-4 flex justify-between items-center">
                        <span>🛎️ ပွဲထွက်ရန်အဆင်သင့် (Ready)</span>
                        <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">{readyOrders.length}</span>
                    </h3>
                    <div className="space-y-4">
                        {readyOrders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-green-100 space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-bold text-sm text-gray-700">#Ord-{order.orderNumber}</span>
                                </div>
                                <div className="text-sm space-y-1">
                                    {order.items.map(item => (
                                        <div key={item.id} className="font-medium">
                                            • {item.menuItem.name} <span className="text-green-600 font-bold">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <form action={handleStatusChange.bind(null, order.id, OrderStatus.DELIVERED)}>
                                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded transition">
                                        🚀 ပို့ဆောင်ပြီးပါပြီ
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}