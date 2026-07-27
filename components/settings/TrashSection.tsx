'use client'

import React, { useState } from 'react'
import { restoreMenuItem, permanentlyDeleteMenuItem } from '@/server/actions/menu'

interface TrashSectionProps {
    deletedItems: any[]
}

export default function TrashSection({ deletedItems }: TrashSectionProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handleRestore = async (id: string) => {
        if (!confirm("ဒီမီနူးကို တကယ်ပြန်ယူမှာလား?")) return;
        setIsProcessing(true)
        const res = await restoreMenuItem(id)
        if (res.success) {
            alert("အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ")
        } else {
            alert(res.error || "အမှားအယွင်းရှိနေပါသည်")
        }
        setIsProcessing(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("သတိပြုရန် - ဒီမီနူးကို အပြီးတိုင်ဖျက်ပစ်မှာ သေချာပါသလား? (ပြန်ယူ၍မရတော့ပါ)")) return;
        setIsProcessing(true)
        const res = await permanentlyDeleteMenuItem(id)
        if (res.success) {
            alert("အောင်မြင်စွာ အပြီးတိုင် ဖျက်ပစ်လိုက်ပါပြီ")
        } else {
            alert(res.error || "အမှားအယွင်းရှိနေပါသည်")
        }
        setIsProcessing(false)
    }

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-gray-100 p-6 lg:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>

            <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-gray-100 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-black">Trash <span className="font-bold text-gray-400 tracking-normal ml-1 text-[10px]">(ဖျက်ထားသော မီနူးများ)</span></h3>
            </div>
            
            <div className="relative z-10">
                {deletedItems.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[1.5rem] bg-gray-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">အမှိုက်ပုံးထဲတွင် မီနူးများ မရှိသေးပါ</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {deletedItems.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-100 p-4 rounded-[1.25rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200 transition-colors shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wider text-black">{item.name}</h4>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                {item.category?.name || 'Uncategorized'}
                                            </span>
                                            <span className="text-[10px] font-black text-black">
                                                {item.price.toLocaleString()} MMK
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={() => handleRestore(item.id)}
                                        disabled={isProcessing}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 group/btn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:-rotate-45 transition-transform"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                        Restore
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isProcessing}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-red-100 hover:bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 group/btn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        Delete
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
