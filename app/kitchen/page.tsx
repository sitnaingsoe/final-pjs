import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getOrders } from '@/server/actions/orders'
import OrdersClient from '@/components/dashboard/OrdersClient'

export const dynamic = 'force-dynamic'

export default async function KitchenPage() {
    const session = await auth()
    
    // Ensure the user is logged in and has a branchId (must be STAFF or BRANCH_ADMIN)
    if (!session?.user?.branchId || !session?.user?.id) {
        redirect('/login')
    }

    // 🔥 အကောင့် ယာယီပိတ်ခံထားရခြင်း (isActive: false) ရှိမရှိ စစ်ဆေးမည်
    const dbUser = await prisma.user.findUnique({
        where: { id: parseInt(session.user.id) },
        select: { isActive: true }
    })
    
    if (!dbUser?.isActive) {
        redirect('/login?error=account_deactivated')
    }

    // Fetch initial orders for the kitchen board
    const result = await getOrders()
    const orders = result.data || []

    return (
        <div className="min-h-[100dvh] w-full bg-white text-gray-800 flex flex-col">
            <header className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between shrink-0 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-black font-black text-2xl">
                        🍳
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-widest uppercase text-white">
                            Kitchen Display System
                        </h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            Branch ID: {session.user.branchId} • Staff: {session.user.name || 'Chef'}
                        </p>
                    </div>
                </div>
                <div>
                    <a href="/dashboard" className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl transition-all border border-white/10 hidden sm:block">
                        Dashboard သို့ ပြန်သွားရန်
                    </a>
                    <a href="/dashboard" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 sm:hidden text-xl">
                        🔙
                    </a>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden bg-gray-50/50">
                <div className="max-w-[1600px] mx-auto h-full">
                    <OrdersClient initialOrders={orders} />
                </div>
            </main>
        </div>
    )
}
