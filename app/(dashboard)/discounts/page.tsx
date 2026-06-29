// app/(dashboard)/discounts/page.tsx
import React from 'react'
import { getDiscounts, createDiscount, toggleDiscountStatus } from '@/server/actions/discounts'

export default async function DiscountsPage() {
    const result = await getDiscounts()
    const discounts = result.data || []

    const handleToggle = async (id: string, currentStatus: boolean) => {
        'use server'
        await toggleDiscountStatus(id, currentStatus)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">လျှော့စျေးနှင့် ပရိုမိုးရှင်း စီမံခန့်ခွဲမှု (Discounts)</h2>
                <p className="text-sm text-gray-500">ဆိုင်၏ ရာခိုင်နှုန်းအလိုက် သို့မဟုတ် ပမာဏအလိုက် လျှော့စျေးများကို ဤနေရာတွင် သတ်မှတ်ပါ</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* (က) ပရိုမိုးရှင်းအသစ် ဆောက်မည့်ဖောင် */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-bold text-gray-700 mb-4">🏷️ ပရိုမိုးရှင်းအသစ် တည်ဆောက်ရန်</h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createDiscount(formData)
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">ပရိုမိုးရှင်းအမည် (Campaign Name)</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - မိုးရာသီအထူး လျှော့စျေး ၁၀%"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">လျှော့ပေးမည့် ပုံစံ (Type)</label>
                            <select
                                name="type"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-orange-500"
                                required
                            >
                                <option value="PERCENTAGE">ရာခိုင်နှုန်းအလိုက် (%)</option>
                                <option value="FIXED">ပမာဏအလိုက် တိုက်ရိုက်လျှော့ရန် (MMK)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">တန်ဖိုး (Value)</label>
                            <input
                                type="number"
                                name="value"
                                placeholder="ဥပမာ - ၁၀ သို့မဟုတ် ၁၀၀၀"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 rounded-lg transition">
                            ပရိုမိုးရှင်း စတင်မည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား ပရိုမိုးရှင်းများပြသသည့် ဇယား */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-700">📋 လက်ရှိ ပရိုမိုးရှင်း ကမ်ပိန်းများ</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                                    <th className="p-4">ကမ်ပိန်းအမည်</th>
                                    <th className="p-4">လျှော့စျေးပုံစံ</th>
                                    <th className="p-4 text-center">လျှော့နှုန်း</th>
                                    <th className="p-4 text-center">အခြေအနေ</th>
                                    <th className="p-4 text-right">လုပ်ဆောင်ချက်</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {discounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">ပရိုမိုးရှင်းများ မရှိသေးပါ။ ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ။</td>
                                    </tr>
                                ) : (
                                    discounts.map((disc) => (
                                        <tr key={disc.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-semibold text-gray-800">{disc.name}</td>
                                            <td className="p-4 text-gray-500">
                                                {disc.type === 'PERCENTAGE' ? 'ရာခိုင်နှုန်းအလိုက် (%)' : 'တိုက်ရိုက်လျှော့ငွေ (MMK)'}
                                            </td>
                                            <td className="p-4 text-center font-bold text-slate-700">
                                                {disc.type === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value.toLocaleString()} MMK`}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${disc.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {disc.isActive ? 'Active (ဖွင့်ထား)' : 'Disabled (ပိတ်ထား)'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <form action={handleToggle.bind(null, disc.id, disc.isActive)}>
                                                    <button
                                                        type="submit"
                                                        className={`text-xs font-bold px-3 py-1 rounded transition ${disc.isActive
                                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                                : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                                                            }`}
                                                    >
                                                        {disc.isActive ? '🛑 ယာယီပိတ်မည်' : '⚡ ပြန်ဖွင့်မည်'}
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}