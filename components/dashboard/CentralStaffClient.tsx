// components/dashboard/CentralStaffClient.tsx
'use client'

import React, { useState, useMemo } from 'react'
import StaffRowActions from './StaffRowActions'

interface Staff {
    id: number
    name: string | null
    email: string
    role: string
    isActive?: boolean | null
    branchId?: string | null
    branch?: {
        name: string
    } | null
    createdAt?: Date | string
}

interface CentralStaffClientProps {
    staffs: Staff[]
    branches: { id: string; name: string }[]
}

export default function CentralStaffClient({ staffs, branches }: CentralStaffClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBranch, setSelectedBranch] = useState<string>('ALL')
    const [selectedRole, setSelectedRole] = useState<string>('ALL')
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

    const filteredStaffs = useMemo(() => {
        return staffs.filter((staff) => {
            const query = searchQuery.toLowerCase().trim()
            const matchesQuery = 
                !query ||
                (staff.name && staff.name.toLowerCase().includes(query)) ||
                staff.email.toLowerCase().includes(query) ||
                (staff.branch?.name && staff.branch.name.toLowerCase().includes(query))

            const matchesBranch = 
                selectedBranch === 'ALL' || 
                staff.branchId === selectedBranch

            const matchesRole = 
                selectedRole === 'ALL' || 
                staff.role === selectedRole

            const isStaffActive = staff.isActive !== false
            const matchesStatus = 
                selectedStatus === 'ALL' || 
                (selectedStatus === 'ACTIVE' && isStaffActive) ||
                (selectedStatus === 'SUSPENDED' && !isStaffActive)

            return matchesQuery && matchesBranch && matchesRole && matchesStatus
        })
    }, [staffs, searchQuery, selectedBranch, selectedRole, selectedStatus])

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedBranch('ALL')
        setSelectedRole('ALL')
        setSelectedStatus('ALL')
    }

    const hasActiveFilters = searchQuery !== '' || selectedBranch !== 'ALL' || selectedRole !== 'ALL' || selectedStatus !== 'ALL'

    return (
        <div className="glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-2xl space-y-6">
            
            {/* 🔍 Search & Filters Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="2"/></svg>
                    </div>
                    <div>
                        <h2 className="text-base font-black uppercase tracking-wider text-foreground">
                            Workforce Directory <span className="font-bold text-muted-foreground tracking-normal ml-1 text-sm">({filteredStaffs.length}/{staffs.length})</span>
                        </h2>
                        <p className="text-[11px] text-muted-foreground font-medium">Find and manage branch managers & restaurant crew</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, branch..."
                            className="w-full bg-card border border-border text-foreground pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>

                    {/* Branch Filter */}
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="bg-card border border-border text-foreground text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                        <option value="ALL">All Branches</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>

                    {/* Role Filter */}
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="bg-card border border-border text-foreground text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="BRANCH_ADMIN">Branch Managers</option>
                        <option value="STAFF">Crew / Staff</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-card border border-border text-foreground text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>

                    {/* Clear Button */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-colors shrink-0"
                            title="Clear all filters"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* 📋 Staff Table */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-foreground min-w-[850px]">
                    <thead className="text-xs uppercase font-black tracking-widest text-muted-foreground border-b border-border/50 bg-muted/20">
                        <tr>
                            <th className="py-4 pl-4 font-black">Employee Name</th>
                            <th className="py-4 font-black">Email Address</th>
                            <th className="py-4 font-black">Assigned Branch</th>
                            <th className="py-4 text-center font-black">Role</th>
                            <th className="py-4 text-center font-black">Status</th>
                            <th className="py-4 text-right font-black pr-4">Security Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredStaffs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mb-4 border border-dashed border-border">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                                        </div>
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">No Employees Found</h3>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {searchQuery ? `No staff matched "${searchQuery}"` : "လက်ရှိတွင် မည်သည့်ဝန်ထမ်းအကောင့်မျှ မရှိသေးပါ။"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredStaffs.map((staff) => {
                                const isStaffActive = staff.isActive !== false

                                return (
                                    <tr key={staff.id} className="hover:bg-muted/30 transition-colors group">
                                        {/* Name */}
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-black text-sm shrink-0 uppercase group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                    {(staff.name || 'U').substring(0, 2)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-foreground block">{staff.name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">ID: #{staff.id}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="py-4 font-mono text-xs text-muted-foreground">{staff.email}</td>

                                        {/* Branch Name */}
                                        <td className="py-4 font-bold text-foreground">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                                <span>{staff.branch?.name || 'ဗဟိုရုံးချုပ် (HQ)'}</span>
                                            </div>
                                        </td>

                                        {/* Role Badge */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                staff.role === 'BRANCH_ADMIN'
                                                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                                                    : 'bg-muted text-muted-foreground border border-border'
                                            }`}>
                                                {staff.role === 'BRANCH_ADMIN' ? 'Branch Manager' : 'Store Crew'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                                                isStaffActive
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-red-50 text-red-600 border-red-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isStaffActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {isStaffActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>

                                        <td className="py-4 text-right pr-4">
                                            <StaffRowActions staff={staff} />
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
