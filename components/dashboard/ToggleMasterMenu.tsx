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
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isAvailable ? 'bg-black' : 'bg-gray-300'} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
            <span className="text-3xs font-bold text-gray-500 uppercase">
                {isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
        </div>
    )
}
