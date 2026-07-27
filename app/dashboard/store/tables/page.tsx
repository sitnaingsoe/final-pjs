// app/(dashboard)/tables/page.tsx
import React from 'react'
import { getTables, createTable } from '@/server/actions/tables'

export default async function TablesPage() {
    const result = await getTables()
    const tables = result.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="2"/><path d="M4 14V5"/><path d="M20 14V5"/><path d="M4 9h16"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M7 17v4"/><path d="M17 17v4"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Tables & QR</h1>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">စားပွဲများနှင့် QR ကုဒ်များ</p>
                    </div>
                </div>
                
                <div className="px-5 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="2"/><path d="M4 14V5"/><path d="M20 14V5"/><path d="M4 9h16"/><rect x="4" y="14" width="16" height="7" rx="2"/></svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Tables</p>
                        <p className="text-xl font-black text-black leading-none mt-1">{tables.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* စားပွဲအသစ်ထည့်ရန် ဖောင် (Left Column) */}
                <div className="lg:col-span-4 bg-white/60 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit lg:sticky top-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="2"/><path d="M4 14V5"/><path d="M20 14V5"/><path d="M4 9h16"/><rect x="4" y="14" width="16" height="7" rx="2"/></svg>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-gray-100 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-black">Add New Table <span className="font-bold text-gray-400 tracking-normal ml-1 text-[10px]">(စားပွဲအသစ် တိုးရန်)</span></h2>
                    </div>

                    <form action={async (formData) => { 'use server'; await createTable(formData) }} className="space-y-5 relative z-10">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Table Name/Number <span className="text-black">*</span></label>
                            <input
                                type="text"
                                name="number"
                                placeholder="e.g. Table 1, VIP-A"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-black placeholder-gray-300 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md uppercase tracking-wider"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full mt-2 relative bg-black hover:bg-gray-900 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            Save Table
                        </button>
                    </form>
                </div>

                {/* QR ကတ်ပြားများ ပြသမည့်နေရာ (Right Column) */}
                <div className="lg:col-span-8">
                    {tables.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 p-16 text-center flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-5 border border-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="2"/><path d="M4 14V5"/><path d="M20 14V5"/><path d="M4 9h16"/><rect x="4" y="14" width="16" height="7" rx="2"/></svg>
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Tables Yet</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                            {tables.map(table => {
                                // Google QR Code API သုံးပြီး ပြသရန် လင့်ခ်တည်ဆောက်ခြင်း
                                const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(table.qrUrl || '')}`

                                return (
                                    <div key={table.id} className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center space-y-5 hover:border-gray-200 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="2"/><path d="M4 14V5"/><path d="M20 14V5"/><path d="M4 9h16"/><rect x="4" y="14" width="16" height="7" rx="2"/></svg>
                                        </div>
                                        
                                        <div className="relative z-10 w-full flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:scale-110 transition-transform mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="2"/><path d="M4 14V5"/><path d="M20 14V5"/><path d="M4 9h16"/><rect x="4" y="14" width="16" height="7" rx="2"/></svg>
                                            </div>
                                            
                                            <div className="text-sm font-black text-black uppercase tracking-wider mb-1">{table.number}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">Table ID</div>

                                            {/* QR Image Wrapper */}
                                            <div className="mt-5 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                                <img src={qrImageSrc} alt={`QR for ${table.number}`} className="w-32 h-32 object-contain rounded-xl" />
                                            </div>

                                            {/* စားပွဲတင် QR Print ထုတ်ရန် ကတ်ပြားပုံစံ ခလုတ် */}
                                            <a
                                                href={qrImageSrc}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] bg-white hover:bg-gray-50 border border-gray-200 text-black font-black px-4 py-3 rounded-xl transition-all shadow-sm hover:shadow-md uppercase tracking-widest group/link"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/link:-translate-y-0.5 transition-transform"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                                Print/Download QR
                                            </a>
                                        </div>
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