import React from 'react'
import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
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
    const { getBranchMasterMenus } = await import('@/server/actions/menu')
    const [menuResult, catResult, tablesResult, masterMenuResult] = await Promise.all([
        getMenuItems(),
        getCategories(),
        getTables(),
        getBranchMasterMenus()
    ])

    const localMenuItems = menuResult.data || []
    const localCategories = catResult.data || []
    
    // Process Master Menus
    const masterMenus = (masterMenuResult.data || [])
    const formattedMasterMenus = masterMenus.map((mb: any) => ({
        id: mb.menuId,
        name: mb.menu.name,
        description: mb.menu.description,
        price: mb.menu.basePrice,
        imageUrl: mb.menu.image,
        isActive: mb.isAvailable && mb.menu.isActive,
        categoryId: 'master', // Virtual category
        isMasterMenu: true,
        addonCategories: mb.menu.addonCategories || []
    }))

    const menuItems = [...localMenuItems, ...formattedMasterMenus]
    const categories = masterMenus.length > 0 
        ? [...localCategories, { id: 'master', name: 'Main Menu' }]
        : localCategories

    // Filter tables for the current branch
    const branchTables = (tablesResult.data || []).filter(t => t.branchId === session.user.branchId)

    return (
        <div className="h-[100dvh] w-full bg-background text-foreground overflow-hidden flex flex-col print:bg-white print:h-auto print:overflow-visible">
            <header className="bg-background border-b border-border/50 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center text-background font-bold text-xl">
                        B
                    </div>
                    <div>
                        <h1 className="font-bold text-base tracking-tight uppercase text-foreground">
                            BiteCraft POS
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                            Cashier Terminal • {session.user.name || 'Staff'} ({session.user.role})
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dashboard Link (Only for admins/managers) */}
                    {session.user.role !== 'STAFF' && (
                        <a 
                            href="/dashboard" 
                            className="text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                            <span className="hidden sm:inline">Dashboard</span>
                        </a>
                    )}

                    {/* 🚪 Logout Button */}
                    <form action={async () => {
                        'use server'
                        await signOut({ redirectTo: '/login' })
                    }}>
                        <button
                            type="submit"
                            className="group relative inline-flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground font-medium px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shrink-0"
                            title="Logout POS Terminal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </header>

            <main className="flex-1 overflow-hidden print:overflow-visible">
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
