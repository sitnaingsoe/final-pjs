// components/dashboard/LogoutConfirmModal.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface LogoutConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isPending?: boolean
}

export default function LogoutConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isPending = false
}: LogoutConfirmModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isPending && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, isPending, onClose])

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={() => !isPending && onClose()}
            />

            {/* Dialog Content */}
            <div className="relative z-10 w-full max-w-md bg-card rounded-[2rem] border border-border/60 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-center overflow-hidden">
                
                {/* Ambient Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-red-500 to-amber-500 rounded-full blur-sm"></div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-lg shadow-red-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </div>

                {/* Title */}
                <h3 className="text-lg font-black text-foreground tracking-tight mb-1">
                    စနစ်မှ ထွက်ခွာမည်မှာ သေချာပါသလား?
                </h3>
                <p className="text-xs text-muted-foreground font-medium mb-6">
                    Are you sure you want to sign out of your account? You will need to log in again to access the system.
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="w-full py-3 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/25 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Logging out...</span>
                            </>
                        ) : (
                            <>
                                <span>Yes, Logout</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    )
}
