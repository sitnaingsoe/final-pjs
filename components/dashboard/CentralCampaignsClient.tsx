// components/dashboard/CentralCampaignsClient.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    createCentralCampaign,
    toggleCentralCampaign,
    deleteCentralCampaign
} from '@/server/actions/centralPromos'

interface CampaignItem {
    code: string
    discountType: string
    discountValue: number
    minOrderAmount: number | null
    maxUsageLimit: number | null
    totalUsedCount: number
    expiryDate: Date | null
    isActive: boolean
    createdAt: Date
    branches: Array<{
        id: string
        name: string
        usedCount: number
        promoId: string
        isActive: boolean
    }>
}

interface CentralCampaignsData {
    campaigns: CampaignItem[]
    branches: Array<{ id: string; name: string }>
}

export default function CentralCampaignsClient({ data }: { data: CentralCampaignsData }) {
    const router = useRouter()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    // Form states
    const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(
        data.branches.map(b => b.id)
    )
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE')

    const allBranchIds = data.branches.map(b => b.id)
    const isAllSelected = selectedBranchIds.length === allBranchIds.length

    const handleSelectAllBranches = (checked: boolean) => {
        if (checked) {
            setSelectedBranchIds(allBranchIds)
        } else {
            setSelectedBranchIds([])
        }
    }

    const handleToggleBranch = (id: string) => {
        if (selectedBranchIds.includes(id)) {
            setSelectedBranchIds(selectedBranchIds.filter(bId => bId !== id))
        } else {
            setSelectedBranchIds([...selectedBranchIds, id])
        }
    }

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const form = e.currentTarget
        const formData = new FormData(form)

        startTransition(async () => {
            const res = await createCentralCampaign(formData, selectedBranchIds)
            if (res.success) {
                setIsCreateOpen(false)
                form.reset()
                router.refresh()
            } else {
                setError(res.error || 'ကမ်ပိန်း ဖန်တီးရာတွင် အမှားရှိနေပါသည်')
            }
        })
    }

    const handleToggle = (code: string, currentActive: boolean) => {
        startTransition(async () => {
            await toggleCentralCampaign(code, !currentActive)
            router.refresh()
        })
    }

    const handleDelete = (code: string) => {
        if (!confirm(`ပရိုမိုကမ်ပိန်း "${code}" ကို ဆိုင်ခွဲအားလုံးမှ အပြီးတိုင် ဖျက်ဆီးမည်မှာ သေချာပါသလား?`)) {
            return
        }

        startTransition(async () => {
            await deleteCentralCampaign(code)
            router.refresh()
        })
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedCode(text)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    // Stats calculations
    const activeCampaigns = data.campaigns.filter(c => c.isActive).length
    const totalRedemptions = data.campaigns.reduce((sum, c) => sum + c.totalUsedCount, 0)

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* 📊 Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Campaigns</p>
                    <h3 className="text-3xl font-black text-foreground mt-2">{activeCampaigns}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Out of {data.campaigns.length} total campaigns</p>
                </div>

                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Redemptions</p>
                    <h3 className="text-3xl font-black text-orange-600 dark:text-orange-400 mt-2 font-mono">{totalRedemptions}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Times used across all branches</p>
                </div>

                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Participating Branches</p>
                    <h3 className="text-3xl font-black text-foreground mt-2">{data.branches.length}</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">Ready for deployment</p>
                </div>
            </div>

            {/* 🏷️ Action Toolbar & Launch Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">Enterprise Campaigns & Master Promos</h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        Create promo vouchers and deploy them across multi-branch locations simultaneously
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedBranchIds(allBranchIds)
                        setIsCreateOpen(true)
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span>Launch New Campaign</span>
                </button>
            </div>

            {/* 📋 Campaigns List */}
            {data.campaigns.length === 0 ? (
                <div className="p-12 text-center glass rounded-[2rem] border border-border/50">
                    <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M2 12h20"/><path d="M7 12v.01"/><path d="M12 12v.01"/><path d="M17 12v.01"/></svg>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">No Active Campaigns Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Launch your first central marketing campaign to offer discounts across your restaurants.
                    </p>
                </div>
            ) : (
                <div className="glass rounded-[2rem] border border-border/50 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs text-foreground">
                            <thead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b border-border/50 bg-muted/20">
                                <tr>
                                    <th className="py-4 pl-6">Campaign Code</th>
                                    <th className="py-4 px-4">Discount Value</th>
                                    <th className="py-4 px-4">Distributed Branches</th>
                                    <th className="py-4 px-4 text-center">Total Redemptions</th>
                                    <th className="py-4 px-4">Validity / Expiry</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {data.campaigns.map((c) => {
                                    const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date()

                                    return (
                                        <tr key={c.code} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-4 pl-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-extrabold text-sm px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-xl tracking-wider">
                                                        {c.code}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(c.code)}
                                                        className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                                                        title="Copy Code"
                                                    >
                                                        {copiedCode === c.code ? (
                                                            <span className="text-[10px] text-green-600 font-bold">Copied!</span>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="font-bold text-foreground">
                                                    {c.discountType === 'PERCENTAGE' ? (
                                                        <span className="text-orange-600 dark:text-orange-400">{c.discountValue}% OFF</span>
                                                    ) : (
                                                        <span className="text-orange-600 dark:text-orange-400">{c.discountValue.toLocaleString()} MMK OFF</span>
                                                    )}
                                                </div>
                                                {c.minOrderAmount && (
                                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                        Min Order: {c.minOrderAmount.toLocaleString()} MMK
                                                    </p>
                                                )}
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {c.branches.map(b => (
                                                        <span key={b.id} className="px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-bold text-foreground">
                                                            {b.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 text-center">
                                                <span className="font-mono font-bold text-sm bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg">
                                                    {c.totalUsedCount} uses
                                                </span>
                                                {c.maxUsageLimit && (
                                                    <p className="text-[9px] text-muted-foreground font-semibold mt-1">
                                                        Limit: {c.maxUsageLimit}/branch
                                                    </p>
                                                )}
                                            </td>

                                            <td className="py-4 px-4">
                                                {c.expiryDate ? (
                                                    <span className={`text-xs font-semibold ${isExpired ? 'text-red-500 font-bold' : 'text-foreground'}`}>
                                                        {new Date(c.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        {isExpired && <span className="block text-[9px] uppercase tracking-wider text-red-600 font-black">Expired</span>}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">No Expiry</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(c.code, c.isActive)}
                                                    disabled={isPending}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                                                        c.isActive 
                                                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {c.isActive ? 'Active' : 'Paused'}
                                                </button>
                                            </td>

                                            <td className="py-4 pr-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(c.code)}
                                                    disabled={isPending}
                                                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Delete Campaign"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ➕ Launch Campaign Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsCreateOpen(false)}></div>
                    <div className="bg-card/95 backdrop-blur-2xl rounded-[2rem] w-full max-w-xl relative z-10 shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-border/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M2 12h20"/><path d="M7 12v.01"/><path d="M12 12v.01"/><path d="M17 12v.01"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground">Launch Global Promo Campaign</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ဗဟိုမှ ပရိုမိုကုဒ် ဖြန့်ဝေခြင်း</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-xl text-muted-foreground hover:bg-muted"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form id="campaignForm" onSubmit={handleCreateSubmit} className="space-y-5">
                                
                                {/* Promo Code */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">
                                        Promo Voucher Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        placeholder="e.g. THINGYAN50, VIP20"
                                        required
                                        disabled={isPending}
                                        className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    />
                                </div>

                                {/* Discount Type & Value */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Discount Type</label>
                                        <select
                                            name="discountType"
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value as any)}
                                            disabled={isPending}
                                            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED_AMOUNT">Fixed Amount (MMK)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">
                                            {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (MMK)'} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="discountValue"
                                            step="any"
                                            min="1"
                                            max={discountType === 'PERCENTAGE' ? 100 : undefined}
                                            placeholder={discountType === 'PERCENTAGE' ? '15' : '5000'}
                                            required
                                            disabled={isPending}
                                            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Min Order & Max Limit */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Min Order Amount (MMK)</label>
                                        <input
                                            type="number"
                                            name="minOrderAmount"
                                            placeholder="Optional (e.g. 20000)"
                                            disabled={isPending}
                                            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Max Usage per Branch</label>
                                        <input
                                            type="number"
                                            name="maxUsageLimit"
                                            placeholder="Optional (e.g. 100)"
                                            disabled={isPending}
                                            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Campaign Expiration Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        disabled={isPending}
                                        className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    />
                                </div>

                                {/* 🎯 Target Branch Deployment Selection */}
                                <div className="pt-2 border-t border-border/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                            Deploy To Branches ({selectedBranchIds.length}/{data.branches.length})
                                        </label>

                                        <label className="inline-flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={(e) => handleSelectAllBranches(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                            />
                                            <span>Select All</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-2 bg-muted/20 rounded-xl border border-border/50">
                                        {data.branches.map(b => {
                                            const isChecked = selectedBranchIds.includes(b.id)

                                            return (
                                                <label
                                                    key={b.id}
                                                    onClick={() => handleToggleBranch(b.id)}
                                                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-all ${
                                                        isChecked 
                                                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-700 dark:text-orange-300' 
                                                            : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="w-3.5 h-3.5 rounded text-orange-600 pointer-events-none"
                                                    />
                                                    <span className="truncate">{b.name}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-border/50 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                disabled={isPending}
                                className="px-5 py-2.5 bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                form="campaignForm"
                                type="submit"
                                disabled={isPending || selectedBranchIds.length === 0}
                                className="px-7 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50"
                            >
                                {isPending ? "Deploying Campaign..." : `Deploy to ${selectedBranchIds.length} Branches`}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}
