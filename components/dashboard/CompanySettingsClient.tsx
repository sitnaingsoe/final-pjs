// components/dashboard/CompanySettingsClient.tsx
'use client'

import React, { useState, useTransition } from 'react'
import {
    updateCompanyName,
    updateOwnerProfile,
    updateOwnerPassword,
    bulkSyncBranchPolicies
} from '@/server/actions/companySettings'
import { useRouter } from 'next/navigation'

interface CompanySettingsData {
    owner: {
        id: number
        name: string
        email: string
    }
    company: {
        id: string
        name: string
        createdAt: Date
        branchCount: number
        staffCount: number
        menuCount: number
        totalRevenue: number
        branches: Array<{
            id: string
            name: string
            currency: string
            taxRate: number
            isAcceptingOrders: boolean
        }>
    }
}

export default function CompanySettingsClient({ data }: { data: CompanySettingsData }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'profile' | 'policies' | 'security'>('profile')

    // Transition States
    const [isNamePending, startNameTransition] = useTransition()
    const [isProfilePending, startProfileTransition] = useTransition()
    const [isPasswordPending, startPasswordTransition] = useTransition()
    const [isSyncPending, startSyncTransition] = useTransition()

    // Alert Messages
    const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Form inputs state
    const [companyName, setCompanyName] = useState(data.company.name)
    const [ownerName, setOwnerName] = useState(data.owner.name)
    const [globalTaxRate, setGlobalTaxRate] = useState('5.0')
    const [globalCurrency, setGlobalCurrency] = useState('MMK')

    // Handle Company Name Update
    const handleUpdateCompanyName = (e: React.FormEvent) => {
        e.preventDefault()
        setNameMsg(null)
        const formData = new FormData()
        formData.append('companyName', companyName)

        startNameTransition(async () => {
            const res = await updateCompanyName(formData)
            if (res.success) {
                setNameMsg({ type: 'success', text: 'ကုမ္ပဏီအမည်ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ' })
                router.refresh()
            } else {
                setNameMsg({ type: 'error', text: res.error || 'အမှားရှိနေပါသည်' })
            }
        })
    }

    // Handle Owner Profile Update
    const handleUpdateOwnerProfile = (e: React.FormEvent) => {
        e.preventDefault()
        setProfileMsg(null)
        const formData = new FormData()
        formData.append('name', ownerName)

        startProfileTransition(async () => {
            const res = await updateOwnerProfile(formData)
            if (res.success) {
                setProfileMsg({ type: 'success', text: 'ပရိုဖိုင်အမည်ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ' })
                router.refresh()
            } else {
                setProfileMsg({ type: 'error', text: res.error || 'အမှားရှိနေပါသည်' })
            }
        })
    }

    // Handle Password Change
    const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPasswordMsg(null)
        const form = e.currentTarget
        const formData = new FormData(form)

        startPasswordTransition(async () => {
            const res = await updateOwnerPassword(formData)
            if (res.success) {
                setPasswordMsg({ type: 'success', text: 'စကားဝှက်ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ' })
                form.reset()
            } else {
                setPasswordMsg({ type: 'error', text: res.error || 'စကားဝှက် ပြောင်းလဲခြင်း မအောင်မြင်ပါ' })
            }
        })
    }

    // Handle Bulk Sync of Tax & Currency
    const handleBulkSync = (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm(`ဆိုင်ခွဲ (${data.company.branchCount}) ခုလုံး၏ Tax Rate ကို ${globalTaxRate}% နှင့် Currency ကို ${globalCurrency} သို့ တစ်ပြိုင်နက် ပြောင်းလဲမည်မှာ သေချာပါသလား?`)) {
            return
        }

        setSyncMsg(null)
        const formData = new FormData()
        formData.append('taxRate', globalTaxRate)
        formData.append('currency', globalCurrency)

        startSyncTransition(async () => {
            const res = await bulkSyncBranchPolicies(formData)
            if (res.success) {
                setSyncMsg({ type: 'success', text: `ဆိုင်ခွဲ (${res.count}) ခုလုံးကို အောင်မြင်စွာ Sync ပြုလုပ်ပြီးပါပြီ` })
                router.refresh()
            } else {
                setSyncMsg({ type: 'error', text: res.error || 'Sync ပြုလုပ်ခြင်း မအောင်မြင်ပါ' })
            }
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* 👑 Top Header & Enterprise Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Branches</p>
                    <h3 className="text-3xl font-black text-foreground mt-2">{data.company.branchCount}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Multi-tenant stores</p>
                </div>
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Staff</p>
                    <h3 className="text-3xl font-black text-foreground mt-2">{data.company.staffCount}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Registered employees</p>
                </div>
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Master Menus</p>
                    <h3 className="text-3xl font-black text-foreground mt-2">{data.company.menuCount}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Catalog items</p>
                </div>
                <div className="glass p-6 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden group">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Lifetime Revenue</p>
                    <h3 className="text-2xl font-black text-foreground mt-2 font-mono">
                        {data.company.totalRevenue.toLocaleString()} <span className="text-xs font-bold text-muted-foreground uppercase">MMK</span>
                    </h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">Settled invoices</p>
                </div>
            </div>

            {/* 🎛️ Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 glass rounded-2xl border border-border/50 w-fit">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'profile'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span>Company Profile</span>
                </button>

                <button
                    onClick={() => setActiveTab('policies')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'policies'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    <span>Global Branch Policies</span>
                </button>

                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'security'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span>Account Security</span>
                </button>
            </div>

            {/* 🏢 TAB 1: Company Profile */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left 2 Cols: Form */}
                    <div className="lg:col-span-2 glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground">Organization Identity</h3>
                                <p className="text-xs text-muted-foreground font-medium">Update your food group brand and central information</p>
                            </div>
                        </div>

                        {nameMsg && (
                            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                nameMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                                <span>{nameMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdateCompanyName} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Company / Enterprise Name</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    disabled={isNamePending}
                                    placeholder="e.g. BiteCraft Food Group"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl bg-card border border-border text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isNamePending}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isNamePending ? "Saving..." : "Save Company Name"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Col: Info Meta Card */}
                    <div className="glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-xl space-y-5">
                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Enterprise Metadata</h4>
                        
                        <div className="space-y-4 text-xs font-medium">
                            <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black block">Company ID</span>
                                <span className="font-mono font-bold text-foreground break-all">{data.company.id}</span>
                            </div>

                            <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black block">Established On</span>
                                <span className="font-bold text-foreground">
                                    {new Date(data.company.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>

                            <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black block">Master Admin</span>
                                <span className="font-bold text-foreground">{data.owner.email}</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* 🌐 TAB 2: Global Branch Policies */}
            {activeTab === 'policies' && (
                <div className="space-y-8">
                    
                    {/* Sync Policy Box */}
                    <div className="glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground">Bulk Policy Synchronization</h3>
                                <p className="text-xs text-muted-foreground font-medium">Standardize financial tax rates and currencies across all {data.company.branchCount} branches</p>
                            </div>
                        </div>

                        {syncMsg && (
                            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                syncMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                                <span>{syncMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleBulkSync} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Global Standard Tax Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={globalTaxRate}
                                        onChange={(e) => setGlobalTaxRate(e.target.value)}
                                        disabled={isSyncPending}
                                        placeholder="5.0"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Applied to invoices at POS and customer QR orders</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Standard Operating Currency</label>
                                    <select
                                        value={globalCurrency}
                                        onChange={(e) => setGlobalCurrency(e.target.value)}
                                        disabled={isSyncPending}
                                        className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                                    >
                                        <option value="MMK">MMK (Myanmar Kyat)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="THB">THB (฿ Thai Baht)</option>
                                        <option value="SGD">SGD (S$ Singapore Dollar)</option>
                                    </select>
                                    <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Default currency for all pricing calculations</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSyncPending}
                                    className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSyncPending ? (
                                        <span>Syncing to all branches...</span>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                                            <span>Apply & Sync to All Branches</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Current Branches Overview Table */}
                    <div className="glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-xl">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-wide mb-4">Branch Status & Policy Overview</h4>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs text-foreground">
                                <thead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="pb-3 pl-2">Branch Name</th>
                                        <th className="pb-3 text-center">Tax Rate</th>
                                        <th className="pb-3 text-center">Currency</th>
                                        <th className="pb-3 text-center pr-2">Order Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {data.company.branches.map((b) => (
                                        <tr key={b.id} className="hover:bg-muted/30">
                                            <td className="py-3 pl-2 font-bold">{b.name}</td>
                                            <td className="py-3 text-center font-mono font-medium">{b.taxRate}%</td>
                                            <td className="py-3 text-center font-mono font-bold text-muted-foreground">{b.currency}</td>
                                            <td className="py-3 text-center pr-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                    b.isAcceptingOrders ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${b.isAcceptingOrders ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {b.isAcceptingOrders ? 'Accepting' : 'Paused'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* 🔒 TAB 3: Account Security */}
            {activeTab === 'security' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Left: Owner Profile */}
                    <div className="glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground">Personal Profile</h3>
                                <p className="text-xs text-muted-foreground font-medium">Manage your display name and email identity</p>
                            </div>
                        </div>

                        {profileMsg && (
                            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                                <span>{profileMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdateOwnerProfile} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    disabled={isProfilePending}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Account Email</label>
                                <input
                                    type="email"
                                    value={data.owner.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-muted-foreground text-sm font-bold cursor-not-allowed"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Email address is tied to master authentication</p>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isProfilePending}
                                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50"
                                >
                                    {isProfilePending ? "Updating..." : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Change Password */}
                    <div className="glass rounded-[2rem] p-6 lg:p-8 border border-border/50 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground">Change Password</h3>
                                <p className="text-xs text-muted-foreground font-medium">Keep your master executive account secure</p>
                            </div>
                        </div>

                        {passwordMsg && (
                            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                                <span>{passwordMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="••••••••"
                                    required
                                    disabled={isPasswordPending}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="•••••••• (Min 6 characters)"
                                    required
                                    disabled={isPasswordPending}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    required
                                    disabled={isPasswordPending}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isPasswordPending}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
                                >
                                    {isPasswordPending ? "Updating Password..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            )}

        </div>
    )
}
