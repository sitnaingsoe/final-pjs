// components/pos/PosLogoutButton.tsx
'use client'

import React, { useState } from 'react'
import { signOut } from 'next-auth/react'
import LogoutConfirmModal from '../dashboard/LogoutConfirmModal'

export default function PosLogoutButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true)
        try {
            localStorage.clear()
            sessionStorage.clear()
            await fetch('/api/auth/logout', { method: 'POST' })
            await signOut({ redirect: false })
        } catch (e) {
            console.error("Logout API failed", e)
        } finally {
            window.location.href = '/login'
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground font-medium px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                title="Logout POS Terminal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span>Logout</span>
            </button>

            <LogoutConfirmModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleConfirmLogout}
                isPending={isLoggingOut}
            />
        </>
    )
}
