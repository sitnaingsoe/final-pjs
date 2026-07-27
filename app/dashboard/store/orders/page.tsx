// app/(dashboard)/orders/page.tsx
import React from 'react'
import { getOrders } from '@/server/actions/orders'
import OrdersClient from '@/components/dashboard/OrdersClient'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const result = await getOrders()
    const orders = result.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <OrdersClient initialOrders={orders} />
        </div>
    )
}