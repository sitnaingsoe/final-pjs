'use client'

import { useState } from 'react'
import { toggleLocalMenuItemAvailability } from '@/server/actions/menu'

export default function ToggleLocalMenu({ itemId, initialIsActive }: { itemId: string, initialIsActive: boolean }) {
    const [isActive, setIsActive] = useState(initialIsActive)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        const newStatus = !isActive
        // Optimistic update
        setIsActive(newStatus)
        
        const result = await toggleLocalMenuItemAvailability(itemId, newStatus)
        if (!result.success) {
            // Revert on failure
            setIsActive(!newStatus)
            alert(result.error || "Failed to update availability")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-slate-900' : 'bg-slate-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isActive ? "Mark Out of Stock" : "Mark In Stock"}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${isActive ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-xs font-semibold text-slate-600">
                {isActive ? 'In Stock' : 'Out of Stock'}
            </span>
        </div>
    )
}
