// app/(dashboard)/categories/page.tsx
import React from 'react'
import { getCategories, createCategory, deleteCategory } from '@/server/actions/categories'

export default async function CategoriesPage() {
    const result = await getCategories()
    const categories = result.data || []

    // Client side ကနေ delete action ကို wrapper လုပ်ရန်
    const handleDelete = async (id: string) => {
        'use server'
        await deleteCategory(id)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">မီနူးအမျိုးအစားများ စီမံခန့်ခွဲမှု (Menu Categories)</h2>
                <p className="text-sm text-gray-500">မုန့်ဟင်းခါး၊ အအေး၊ အကြော်စုံ စသည့် မီနူးအုပ်စုများကို ဤနေရာတွင် သတ်မှတ်နိုင်ပါသည်</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* (က) အမျိုးအစားအသစ်ထည့်ရန် ဖောင် (Add Category Form) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-bold text-gray-700 mb-4">➕ အမျိုးအစားအသစ်ထည့်ရန်</h3>

                    <form
                        action={async (formData) => {
                            'use server'
                            await createCategory(formData) // 👈 return ပြန်လာတဲ့ object ကို form ဆီမရောက်အောင် ဤနေရာမှာတင် ဖြတ်ထားလိုက်ခြင်း
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">အမျိုးအစားအမည် (Name)</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="ဥပမာ - အအေးနှင့်ဖျော်ရည်"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">အကျဉ်းချုပ်ဖော်ပြချက် (Description)</label>
                            <textarea
                                name="description"
                                placeholder="ဥပမာ - လန်းဆန်းစေသော ကော်ဖီနှင့် လက်ဖက်ရည်များ"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-orange-500 h-24 resize-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 rounded-lg transition">
                            သိမ်းဆည်းမည်
                        </button>
                    </form>
                </div>

                {/* (ခ) ရှိပြီးသား အမျိုးအစားများပြဇယား (Categories Table) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-700">📂 သတ်မှတ်ထားသော စာရင်းများ</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                                    <th className="p-4">အမျိုးအစားအမည်</th>
                                    <th className="p-4">ဖော်ပြချက်</th>
                                    <th className="p-4 text-center">ဟင်းပွဲအရေအတွက်</th>
                                    <th className="p-4 text-right">လုပ်ဆောင်ချက်</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400">ဒေတာမရှိသေးပါ။ ဘယ်ဘက်ဖောင်မှ စတင်ထည့်သွင်းပါ။</td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-semibold text-gray-800">{cat.name}</td>
                                            <td className="p-4 text-gray-500 max-w-xs truncate">{cat.description || '-'}</td>
                                            <td className="p-4 text-center">
                                                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                                    {cat._count.menuItems} ပွဲ
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <form action={handleDelete.bind(null, cat.id)}>
                                                    <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline">
                                                        🗑️ ဖျက်မည်
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