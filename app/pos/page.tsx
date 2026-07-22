import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getMenuItems } from '@/server/actions/menu'
import { getCategories } from '@/server/actions/categories'
import { getTables } from '@/server/actions/tables'
import PosTerminal from '@/components/pos/PosTerminal'

export default async function PosPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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

    const resolvedParams = await searchParams;
    const initialTableNumber = resolvedParams?.tableNumber as string | undefined;

    // Fetch data for the POS
    const [menuResult, catResult, tablesResult] = await Promise.all([
        getMenuItems(),
        getCategories(),
        getTables()
    ])

    const menuItems = menuResult.data || []
    const categories = catResult.data || []
    // Filter tables for the current branch
    const branchTables = (tablesResult.data || []).filter(t => t.branchId === session.user.branchId)

    return (
        <div className="h-[100dvh] w-full bg-white text-gray-800 overflow-hidden flex flex-col">
            <header className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-black font-black text-xl">
                        B
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500">
                            BiteCraft POS
                        </h1>
                        <p className="text-3xs text-gray-400 font-bold uppercase tracking-wider">
                            Cashier Terminal • {session.user.name || 'Staff'}
                        </p>
                    </div>
                </div>
                <div>
                    <a href="/dashboard" className="text-xs font-bold bg-gray-200 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors hidden sm:block">
                        Dashboard သို့ ပြန်သွားရန်
                    </a>
                    <a href="/dashboard" className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-slate-700 rounded-lg transition-colors sm:hidden text-lg">
                        🔙
                    </a>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <PosTerminal 
                    menuItems={menuItems} 
                    categories={categories} 
                    tables={branchTables}
                    branchId={session.user.branchId} 
                    initialTableNumber={initialTableNumber}
                />
            </main>
        </div>
    )
}
