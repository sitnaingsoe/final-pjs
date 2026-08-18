// components/dashboard/StoreStaffClient.tsx
'use client'

import React, { useState, useMemo, useTransition } from 'react'
import { toggleStaffStatusBranch } from '@/server/actions/staff'
import { useRouter } from 'next/navigation'

interface Staff {
    id: number
    name: string | null
    email: string
    role?: string
    isActive?: boolean | null
    createdAt: Date | string
}

interface StoreStaffClientProps {
    staffs: Staff[]
}

export default function StoreStaffClient({ staffs }: StoreStaffClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
    const [actionId, setActionId] = useState<number | null>(null)

    const filteredStaffs = useMemo(() => {
        return staffs.filter((staff) => {
            const query = searchQuery.toLowerCase().trim()
            const matchesQuery = 
                !query ||
                (staff.name && staff.name.toLowerCase().includes(query)) ||
                staff.email.toLowerCase().includes(query)

            const isStaffActive = staff.isActive !== false
            const matchesStatus = 
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && isStaffActive) ||
                (statusFilter === 'INACTIVE' && !isStaffActive)

            return matchesQuery && matchesStatus
        })
    }, [staffs, searchQuery, statusFilter])

    const handleToggle = (id: number, currentStatus: boolean | null | undefined) => {
        setActionId(id)
        startTransition(async () => {
            await toggleStaffStatusBranch(id, currentStatus !== false)
            router.refresh()
            setActionId(null)
        })
    }

    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('ALL')
    }

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL'

    return (
        <div className="glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-2xl space-y-6">
            
            {/* 🔍 Search & Filters Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="2"/></svg>
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-foreground">
                            Active Staff Members <span className="font-medium text-muted-foreground tracking-normal ml-1 text-sm">({filteredStaffs.length}/{staffs.length})</span>
                        </h2>
                        <p className="text-[11px] text-muted-foreground font-medium">Find and manage your restaurant crew</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search staff by name, email..."
                            className="w-full bg-card border border-border text-foreground pl-9 pr-4 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-card border border-border text-foreground text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    {/* Clear Button */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-colors shrink-0"
                            title="Clear search"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* 📋 Staff Table */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-foreground min-w-[700px]">
                    <thead className="text-xs uppercase font-bold tracking-wider text-muted-foreground border-b border-border/50 bg-muted/20">
                        <tr>
                            <th className="py-4 pl-4 font-bold">Employee</th>
                            <th className="py-4 font-bold">Email Address</th>
                            <th className="py-4 font-bold">Start Date</th>
                            <th className="py-4 text-center font-bold">Status</th>
                            <th className="py-4 text-right font-bold pr-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredStaffs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mb-4 border border-dashed border-border">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground tracking-wide mb-1">No Staff Found</h3>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {searchQuery ? `No staff matched "${searchQuery}"` : "Click 'Add Staff' above to begin"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredStaffs.map((staff) => {
                                const isStaffActive = staff.isActive !== false
                                const isThisPending = isPending && actionId === staff.id

                                return (
                                    <tr key={staff.id} className="hover:bg-muted/30 transition-colors group">
                                        {/* Name */}
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold text-sm shrink-0 uppercase group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                                    {staff.name?.substring(0, 2) || 'ST'}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-foreground block">{staff.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">ID: #{staff.id}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="py-4 font-mono text-xs text-muted-foreground">
                                            {staff.email}
                                        </td>

                                        {/* Start Date */}
                                        <td className="py-4 font-medium text-xs text-muted-foreground font-mono">
                                            {new Date(staff.createdAt).toLocaleDateString('en-GB')}
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                isStaffActive
                                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                                    : 'bg-red-50 text-red-600 border-red-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isStaffActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {isStaffActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Action Button */}
                                        <td className="py-4 text-right pr-4">
                                            <button 
                                                type="button"
                                                onClick={() => handleToggle(staff.id, staff.isActive)}
                                                disabled={isPending}
                                                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 border ${
                                                    isStaffActive 
                                                        ? 'bg-card border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 hover:text-red-600' 
                                                        : 'bg-card border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-200 hover:text-green-700'
                                                }`}
                                            >
                                                {isThisPending ? "Updating..." : (isStaffActive ? 'Disable' : 'Enable')}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
