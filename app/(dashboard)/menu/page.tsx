// app/(dashboard)/menu/page.tsx
import React from 'react'
import { getMenuItems, createMenuItem, deleteMenuItem } from '@/server/actions/menu'
import { getCategories } from '@/server/actions/categories'

export default async function MenuPage() {
    // မီနူးစာရင်းရော၊ Dropdown မှာ သုံးဖို့ Category စာရင်းပါ တပြိုင်တည်း ဆွဲထုတ်ခြင်း
    const [menuResult, catResult] = await Promise.all([getMenuItems(), getCategories()])

    const menuItems = menuResult.data || []
    const categories = catResult.data || []

    const handleDelete = async (id: string) => {
        'use server'
        await deleteMenuItem(id)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">စားစရာ မီနူးများ စီမံခန့်ခွဲမှု (Menu Items)</h2>
                <p className="text-sm text-gray-500">ဟင်းပွဲများ၊ မုန့်များနှင့် ဖျော်ရည်များကို ဈေးနှုန်းသတ်မှတ်၍ ဤနေရာတွင် ထည့်သွင်းနိုင်ပါသည်</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* (က) မီနူးအသစ်ထည့်ရန် ဖောင် */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-bold text-gray-700 mb-4">🍔 ဟင်းပွဲအသစ် ထည့်သွင်းရန်</h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createMenuItem(formData)
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">ဟင်းပွဲ/မုန့် အမည်</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - ကြက်သားတုတ်ထိုး"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">ဈေးနှုန်း (MMK)</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="ဥပမာ - ၃၅၀၀"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">မီနူးအုပ်စု ရွေးချယ်ရန်</label>
                            <select
                                name="categoryId"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-orange-500"
                                required
                            >
                                <option value="">-- အမျိုးအစား ရွေးပါ --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">ပါဝင်ပစ္စည်း သို့မဟုတ် ဖော်ပြချက်</label>
                            <textarea
                                name="description"
                                placeholder="ဥပမာ - ကြက်သားသန့်သန့်ကို အချိုရည်ဖြင့် ချက်ထားပါသည်"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500 h-20 resize-none"
                            />
                        </div>

                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 rounded-lg transition">
                            မီနူးထဲသို့ ထည့်မည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား မီနူးများပြသသည့် ဇယား */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-700">📋 လက်ရှိ ရောင်းချနေသော မီနူးများ</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                                    <th className="p-4">ဟင်းပွဲအမည်</th>
                                    <th className="p-4">အုပ်စု (Category)</th>
                                    <th className="p-4 text-center">ဈေးနှုန်း</th>
                                    <th className="p-4 text-right">လုပ်ဆောင်ချက်</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {menuItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400">မီနူးများ မရှိသေးပါ။ ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ။</td>
                                    </tr>
                                ) : (
                                    menuItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-800">{item.name}</div>
                                                <div className="text-xs text-gray-400 truncate max-w-xs">{item.description || '-'}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded font-medium">
                                                    {item.category.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-gray-700">
                                                {item.price.toLocaleString()} MMK
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    formAction={handleDelete.bind(null, item.id)}
                                                    formMethod="POST"
                                                    className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline"
                                                >
                                                    {/* Next.js Server actions flow အရ တိုက်ရိုက် form သုံးနိုင်ရန် button အဖြစ် ထားပါသည် */}
                                                    <form action={handleDelete.bind(null, item.id)}>
                                                        <button type="submit">🗑️ ဖျက်မည်</button>
                                                    </form>
                                                </button>
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