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
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl mt-8">
            <h3 className="text-xl font-black text-slate-100 flex items-center gap-2 mb-6">
                <span className="text-red-500">🗑️</span> ဖျက်ထားသော မီနူးများ (Trash)
            </h3>
            
            {deletedItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 border border-dashed border-slate-700 rounded-2xl">
                    အမှိုက်ပုံးထဲတွင် မီနူးများ မရှိသေးပါ
                </div>
            ) : (
                <div className="space-y-4">
                    {deletedItems.map((item) => (
                        <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-slate-300">{item.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">Category: {item.category?.name} | Price: {item.price.toLocaleString()} MMK</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleRestore(item.id)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-slate-800 text-green-400 font-bold text-xs rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    Restore
                                </button>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-red-500/10 text-red-500 font-bold text-xs rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                >
                                    Permanent Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
