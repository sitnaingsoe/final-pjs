// app/(dashboard)/orders/page.tsx
import React from 'react'
import { getOrders } from '@/server/actions/orders'
import OrdersClient from '@/components/dashboard/OrdersClient'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const result = await getOrders()
    const orders = result.data || []

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <a 
                    href="/kitchen" 
                    target="_blank" 
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg"
                >
                    <span>📺</span>
                    Open Full-Screen KDS
                </a>
            </div>
            <OrdersClient initialOrders={orders} />
        </div>
    )
}