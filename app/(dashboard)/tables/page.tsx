// app/(dashboard)/tables/page.tsx
import React from 'react'
import { getTables, createTable } from '@/server/actions/tables'

export default async function TablesPage() {
    const result = await getTables()
    const tables = result.data || []

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">စားပွဲများနှင့် QR ကုဒ်များ စီမံခန့်ခွဲမှု (Table QR)</h2>
                <p className="text-sm text-gray-500">စားပွဲအသစ်များတိုးပြီး Customer များ Scan ဖတ်၍ မှာယူနိုင်မည့် QR Code များကို ထုတ်ယူပါ</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* စားပွဲအသစ်ထည့်ရန် ဖောင် */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-bold text-gray-700 mb-4">➕ စားပွဲအသစ် တိုးရန်</h3>
                    <form action={async (formData) => { 'use server'; await createTable(formData) }} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">စားပွဲနံပါတ် သို့မဟုတ် အမည်</label>
                            <input
                                type="text"
                                name="number"
                                placeholder="ဥပမာ - Table 1 သို့မဟုတ် VIP-A"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 rounded-lg transition">
                            စားပွဲထည့်သွင်းမည်
                        </button>
                    </form>
                </div>

                {/* QR ကတ်ပြားများ ပြသမည့်နေရာ */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tables.length === 0 ? (
                        <div className="bg-white p-8 text-center text-gray-400 rounded-xl border col-span-2">စားပွဲများ မရှိသေးပါ။</div>
                    ) : (
                        tables.map(table => {
                            // Google QR Code API သုံးပြီး ပြသရန် လင့်ခ်တည်ဆောက်ခြင်း
                            const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(table.qrUrl || '')}`

                            return (
                                <div key={table.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center space-y-3">
                                    <div className="text-lg font-bold text-slate-800">🍽️ {table.number}</div>

                                    {/* QR Image */}
                                    <div className="bg-gray-50 p-3 rounded-lg border">
                                        <img src={qrImageSrc} alt={`QR for ${table.number}`} className="w-32 h-32" />
                                    </div>

                                    <p className="text-xs text-gray-400 break-all max-w-[200px]">{table.qrUrl}</p>

                                    {/* စားပွဲတင် QR Print ထုတ်ရန် ကတ်ပြားပုံစံ ခလုတ် */}
                                    <a
                                        href={qrImageSrc}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg transition"
                                    >
                                        🖨️ QR ပုံကြီးဒေါင်းလုဒ်ဆွဲမည်
                                    </a>
                                </div>
                            )
                        })
                    )}
                </div>

            </div>
        </div>
    )
}