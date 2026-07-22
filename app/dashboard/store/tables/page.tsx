// app/(dashboard)/tables/page.tsx
import React from 'react'
import { getTables, createTable } from '@/server/actions/tables'

export default async function TablesPage() {
    const result = await getTables()
    const tables = result.data || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500">
                        စားပွဲများနှင့် QR ကုဒ်များ (Table QR)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">စားပွဲအသစ်များတိုးပြီး Customer များ Scan ဖတ်၍ မှာယူနိုင်မည့် QR Code များကို ထုတ်ယူပါ</p>
                </div>
                <div className="px-4 py-2 bg-gray-50/50 backdrop-blur-md rounded-xl border border-gray-200 flex items-center gap-3">
                    <span className="text-2xl">🪑</span>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Tables</p>
                        <p className="text-xl font-black text-gray-800">{tables.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* စားပွဲအသစ်ထည့်ရန် ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-gray-50/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/60 shadow-xl h-fit sticky top-6">
                    <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2 text-lg">
                        <span className="text-black">➕</span> စားပွဲအသစ် တိုးရန်
                    </h3>
                    <form action={async (formData) => { 'use server'; await createTable(formData) }} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">စားပွဲနံပါတ် သို့မဟုတ် အမည်</label>
                            <input
                                type="text"
                                name="number"
                                placeholder="ဥပမာ - Table 1 သို့မဟုတ် VIP-A"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-black placeholder-slate-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-gray-800 hover:to-gray-500 text-black text-sm font-bold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0">
                            စားပွဲထည့်သွင်းမည်
                        </button>
                    </form>
                </div>

                {/* QR ကတ်ပြားများ ပြသမည့်နေရာ (Right Column) */}
                <div className="lg:col-span-8">
                    {tables.length === 0 ? (
                        <div className="bg-gray-50/40 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-12 text-center flex flex-col items-center justify-center">
                            <span className="text-5xl mb-4 opacity-50">🪑</span>
                            <h3 className="text-lg font-bold text-gray-700">စားပွဲများ မရှိသေးပါ</h3>
                            <p className="text-sm text-gray-400 mt-2">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {tables.map(table => {
                                // Google QR Code API သုံးပြီး ပြသရန် လင့်ခ်တည်ဆောက်ခြင်း
                                const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(table.qrUrl || '')}`

                                return (
                                    <div key={table.id} className="group bg-gray-50/40 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 hover:bg-gray-100/50 hover:border-black/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center border border-black/20 text-gray-800 text-xl">
                                            🍽️
                                        </div>
                                        
                                        <div className="text-lg font-black text-gray-800 uppercase tracking-wider">{table.number}</div>

                                        {/* QR Image Wrapper - Made to look like a crisp white card */}
                                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-lg shadow-orange-500/5 group-hover:shadow-orange-500/20 transition-all">
                                            <img src={qrImageSrc} alt={`QR for ${table.number}`} className="w-32 h-32 object-contain rounded-lg" />
                                        </div>

                                        {/* စားပွဲတင် QR Print ထုတ်ရန် ကတ်ပြားပုံစံ ခလုတ် */}
                                        <a
                                            href={qrImageSrc}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 w-full text-center text-xs bg-gray-200 hover:bg-slate-700 border border-gray-300 text-gray-700 group-hover:text-gray-800 group-hover:border-black/30 font-bold px-4 py-2.5 rounded-xl transition-all"
                                        >
                                            🖨️ ပုံကြီးဒေါင်းလုဒ်ဆွဲမည်
                                        </a>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}