'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPromoCode, deletePromoCode, togglePromoCode } from '@/server/actions/promocodes'

export default function PromoCodeManager({ branchId, promoCodes }: { branchId: string, promoCodes: any[] }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxUsageLimit: '',
        expiryDate: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const res = await createPromoCode({ ...form, branchId })
        setIsSubmitting(false)
        if (res.success) {
            alert("ပရိုမိုကုဒ် အသစ်ထည့်သွင်းမှု အောင်မြင်ပါသည်")
            setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', maxUsageLimit: '', expiryDate: '' })
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await togglePromoCode(id, !currentStatus)
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("ဖျက်ရန် သေချာပါသလား?")) return
        await deletePromoCode(id)
        router.refresh()
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:p-8 h-fit lg:sticky top-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                </div>
                
                <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-gray-100 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-black">New Promo Code <span className="font-bold text-gray-400 tracking-normal ml-1 text-[10px]">(အသစ်ပြုလုပ်ရန်)</span></h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Code Name <span className="text-black">*</span></label>
                        <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. VIP20" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-black placeholder-gray-300 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md uppercase tracking-wider" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Type <span className="text-black">*</span></label>
                            <div className="relative">
                                <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md appearance-none">
                                    <option value="PERCENTAGE">ရာခိုင်နှုန်း (%)</option>
                                    <option value="FIXED_AMOUNT">ငွေပမာဏ (MMK)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Value <span className="text-black">*</span></label>
                            <input required type="number" min="1" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} placeholder="e.g. 10" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-gray-300 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md font-mono" />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Min Order Amount <span className="text-gray-300 font-bold ml-1">(Optional)</span></label>
                        <input type="number" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} placeholder="e.g. 15000" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-gray-300 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md font-mono" />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Usage Limit <span className="text-gray-300 font-bold ml-1">(Optional)</span></label>
                        <input type="number" value={form.maxUsageLimit} onChange={e => setForm({...form, maxUsageLimit: e.target.value})} placeholder="e.g. 100" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-gray-300 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md font-mono" />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Expiry Date <span className="text-gray-300 font-bold ml-1">(Optional)</span></label>
                        <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md" />
                    </div>
                    
                    <button disabled={isSubmitting} className="w-full mt-2 relative bg-black hover:bg-gray-900 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                        {!isSubmitting && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>}
                        {isSubmitting ? "Saving..." : "Save Promo Code"}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2">
                {promoCodes.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 p-16 text-center flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-5 border border-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Promo Codes</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {promoCodes.map((promo) => (
                            <div key={promo.id} className={`group bg-white border ${promo.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60 hover:opacity-100'} rounded-2xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start gap-2 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${promo.isActive ? 'bg-black text-white shadow-md shadow-black/10' : 'bg-gray-100 text-gray-400'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
                                            </div>
                                            <h4 className={`font-black text-sm uppercase tracking-wider leading-tight transition-colors ${promo.isActive ? 'text-black' : 'text-gray-500'}`}>
                                                {promo.code}
                                            </h4>
                                        </div>
                                        
                                        <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest shrink-0 ${promo.isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                                            {promo.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1 mt-3">
                                        <span className={`text-3xl font-black ${promo.isActive ? 'text-black' : 'text-gray-500'} tracking-tighter`}>
                                            {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}`}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {promo.discountType === 'FIXED_AMOUNT' ? 'MMK OFF' : 'OFF'}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                                        {promo.minOrderAmount && (
                                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                                <span className="text-gray-400">Min Order</span>
                                                <span className="text-black font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{promo.minOrderAmount.toLocaleString()} MMK</span>
                                            </div>
                                        )}
                                        {promo.expiryDate && (
                                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                                <span className="text-gray-400">Expires</span>
                                                <span className="text-black font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{new Date(promo.expiryDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                            <span className="text-gray-400">Usage</span>
                                            <span className="text-black font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                {promo.usedCount} <span className="text-gray-300">/</span> {promo.maxUsageLimit ? promo.maxUsageLimit : '∞'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 relative z-10">
                                    <button
                                        onClick={() => handleToggle(promo.id, promo.isActive)}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 group/btn ${promo.isActive
                                                ? 'bg-white hover:bg-gray-50 text-black border-gray-200 shadow-sm hover:shadow-md'
                                                : 'bg-black hover:bg-gray-900 text-white border-black shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        {promo.isActive ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                                                <span>Disable</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                                <span>Activate</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        className="p-2.5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl transition-all hover:shadow-sm"
                                        title="Delete Promo Code"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
