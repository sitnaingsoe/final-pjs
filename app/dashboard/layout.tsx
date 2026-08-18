// app/dashboard/layout.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import LogoutConfirmModal from '@/components/dashboard/LogoutConfirmModal'

// Icon definitions
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect width="4" height="6" x="10" y="16"/><path d="M3 9h18"/><path d="M9 9v4"/><path d="M15 9v4"/></svg>;
const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M2 12h20"/><path d="M7 12v.01"/><path d="M12 12v.01"/><path d="M17 12v.01"/></svg>;
const TableIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const LogoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>;

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const pathname = usePathname()

    const role = session?.user?.role
    const userName = session?.user?.name || 'ဝန်ထမ်း'

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // 🚪 စနစ်မှထွက်ပြီး Login Page သို့ ပြန်မောင်းထုတ်မည့် function
    const handleLogout = async () => {
        setIsLoggingOut(true)
        localStorage.removeItem('accessToken')
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
            console.error("Logout API failed", e)
        }
        await signOut({ callbackUrl: '/login' })
    }

    const isStoreView = pathname.startsWith('/dashboard/store')

    // 🎯 Role နှင့် လက်ရှိ Route အပေါ်မူတည်ပြီး လမ်းကြောင်းသစ်များ ခွဲခြားသတ်မှတ်ခြင်း
    const links = (role === 'COMPANY_HEAD' && !isStoreView)
        ? [
            { name: "Overview Dashboard", path: "/dashboard/hq", icon: <HomeIcon /> },
            { name: "ဆိုင်ခွဲများ (Branches)", path: "/dashboard/hq/branches", icon: <StoreIcon /> },
            { name: "ဗဟိုပရိုမိုကုဒ် (Campaigns)", path: "/dashboard/hq/campaigns", icon: <TicketIcon /> },
            { name: "ဘေလ်မှတ်တမ်းများ (Invoices)", path: "/dashboard/hq/invoices", icon: <InvoiceIcon /> },
            { name: "ဝန်ထမ်းများ (Staff)", path: "/dashboard/hq/staff", icon: <UsersIcon /> },
            { name: "ဗဟိုမီနူး (Main Menu)", path: "/dashboard/hq/menu", icon: <MenuIcon /> },
            { name: "ဗဟိုဆက်တင် (HQ Settings)", path: "/dashboard/hq/settings", icon: <SettingsIcon /> },
        ]
        : [
            ...(role === 'COMPANY_HEAD' ? [{ name: "← Back to HQ Control", path: "/dashboard/hq", icon: <HomeIcon /> }] : []),
            { name: "ပင်မ Dashboard", path: "/dashboard/store", icon: <HomeIcon /> },
            { name: "အော်ဒါများ (Orders)", path: "/dashboard/store/orders", icon: <OrdersIcon /> },
            { name: "ဘေလ်မှတ်တမ်းများ (Invoices)", path: "/dashboard/store/invoices", icon: <InvoiceIcon /> },
            { name: "မီနူးအုပ်စု (Categories)", path: "/dashboard/store/categories", icon: <FolderIcon /> },
            { name: "စားစရာများ (Menu)", path: "/dashboard/store/menu", icon: <MenuIcon /> },
            { name: "အပိုပစ္စည်းများ (Addons)", path: "/dashboard/store/addons", icon: <PlusIcon /> },
            { name: "လျှော့စျေး (Discounts)", path: "/dashboard/store/discounts", icon: <TagIcon /> },
            { name: "ပရိုမိုကုဒ်များ (Promo Codes)", path: "/dashboard/store/promo-codes", icon: <TicketIcon /> },
            { name: "စားပွဲများ (Tables)", path: "/dashboard/store/tables", icon: <TableIcon /> },
            { name: "ဝန်ထမ်းများ (Staff)", path: "/dashboard/store/staff", icon: <UsersIcon /> },
            { name: "ဆက်တင် (Settings)", path: "/dashboard/store/settings", icon: <SettingsIcon /> },
        ]

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
                <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
        )
    }

    const navigationLinks = (
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
            {links.map((link) => {
                const isActive = pathname === link.path

                return (
                    <Link
                        key={link.path}
                        href={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 transition-all duration-300 text-sm font-semibold relative overflow-hidden rounded-2xl ${
                            isActive
                                ? 'text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full" />
                        )}
                        <span className={`relative z-10 transition-colors ${isActive ? 'text-orange-500' : 'text-muted-foreground group-hover:text-foreground'}`}>{link.icon}</span>
                        <span className="relative z-10 tracking-wide">{link.name}</span>
                    </Link>
                )
            })}
        </nav>
    )

    const sidebarFooter = (
        <div className="p-4 border-t border-border flex items-center justify-between gap-2 bg-card">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-orange-500/20">
                    {userName.substring(0, 2)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{role || 'STAFF'}</p>
                </div>
            </div>

            <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-2.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-colors shrink-0 group cursor-pointer"
                title="စနစ်မှထွက်မည်"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
        </div>
    )

    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden relative">

            {/* ၁။ SIDEBAR (Desktop View) */}
            <aside className="w-[280px] bg-card text-card-foreground flex-col justify-between hidden lg:flex border-r border-border z-20 relative">
                <div className="p-6 pb-4 flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/20">
                        <LogoIcon />
                    </div>
                    <div>
                        <span className="text-base font-bold tracking-tight text-foreground leading-none block">BITECRAFT</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block mt-1">Operating System</span>
                    </div>
                </div>
                {navigationLinks}
                {sidebarFooter}
            </aside>

            {/* ၂။ MOBILE DRAWER */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    <aside className="relative w-[280px] bg-card text-foreground flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300 border-r border-border">
                        <div>
                            <div className="p-6 pb-4 flex items-center justify-between border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <LogoIcon />
                                    </div>
                                    <div>
                                        <span className="text-base font-bold tracking-tight text-foreground leading-none block">BITECRAFT</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block mt-1">Operating System</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                                </button>
                            </div>
                            {navigationLinks}
                        </div>
                        {sidebarFooter}
                    </aside>
                </div>
            )}

            {/* ၃။ MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background">

                {/* TOP NAVBAR */}
                <header className="h-[76px] bg-card/80 backdrop-blur-2xl flex items-center justify-between px-6 border-b border-border sticky top-0 z-10 relative">
                    <div className="flex items-center gap-4 relative z-10">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2.5 -ml-2 rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            aria-label="Open menu"
                        >
                            <HamburgerIcon />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center hidden sm:flex border border-orange-500/20">
                                {role === 'COMPANY_HEAD' ? <StoreIcon /> : <HomeIcon />}
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-foreground tracking-tight uppercase">
                                    {role === 'COMPANY_HEAD' ? 'Central Control' : 'Branch Operation'}
                                </h1>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                    Workspace
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <ThemeToggle />
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8 relative">
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                isPending={isLoggingOut}
            />

        </div>
    )
}