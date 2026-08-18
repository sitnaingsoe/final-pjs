'use client'

import { useState } from 'react'
import { toggleMasterMenuAvailability } from '@/server/actions/menu'

export default function ToggleMasterMenu({ menuId, initialIsAvailable }: { menuId: string, initialIsAvailable: boolean }) {
    const [isAvailable, setIsAvailable] = useState(initialIsAvailable)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        const newStatus = !isAvailable
        // Optimistic update
        setIsAvailable(newStatus)
        
        const result = await toggleMasterMenuAvailability(menuId, newStatus)
        if (!result.success) {
            // Revert on failure
            setIsAvailable(!newStatus)
            alert(result.error || "Failed to update availability")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isAvailable ? 'bg-slate-900' : 'bg-slate-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${isAvailable ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-xs font-semibold text-slate-600">
                {isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
        </div>
    )
}
