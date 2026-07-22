// app/(dashboard)/settings/page.tsx
import React from 'react'
import { getRestaurantSettings, updateRestaurantSettings } from '@/server/actions/settings'
import { getDeletedMenuItems } from '@/server/actions/menu'
import TrashSection from '@/components/settings/TrashSection'

export default async function SettingsPage() {
    const result = await getRestaurantSettings()
    const settings = result.data

    const deletedResult = await getDeletedMenuItems()
    const deletedItems = deletedResult.data || []

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <span className="text-black">⚙️</span> ဆိုင်အထွေထွေ ဆက်တင်များ (Settings)
                </h2>
                <p className="text-sm text-gray-500 mt-1">ဆိုင်၏ အချက်အလက်များနှင့် အွန်လိုင်းမှ အော်ဒါလက်ခံမည့် အခြေအနေကို ပြင်ဆင်ပါ</p>
            </div>

            {/* ပင်မ ဆက်တင်ဖောင်ကြီး */}
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-3xl shadow-xl shadow-black/20">
                <form
                    action={async (formData) => {
                        'use server'
                        await updateRestaurantSettings(formData)
                    }}
                    className="space-y-8"
                >
                    {/* ရှိပြီးသား Setting ID ကို Backend သို့ ခိုးပို့ရန် Hidden Input */}
                    <input type="hidden" name="id" value={settings?.id || ''} />

                    {/* ⚡ ဆိုင်ဖွင့်/ပိတ် ထိန်းချုပ်သည့် နေရာ (UX Status Box) */}
                    <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        settings?.isAcceptingOrders 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        <div>
                            <h4 className={`font-black text-lg flex items-center gap-2 ${settings?.isAcceptingOrders ? 'text-green-600' : 'text-red-600'}`}>
                                <span className={`w-3 h-3 rounded-full ${settings?.isAcceptingOrders ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                အွန်လိုင်း အော်ဒါစနစ် အခြေအနေ
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">လက်ရှိတွင် ကတ်စတမ်မာများ အော်ဒါမှာယူ၍ {settings?.isAcceptingOrders ? 'ရနေပါသည်' : 'မရသေးပါ'}</p>
                        </div>

                        {/* Native HTML Select အား Toggle Switch သဖွယ် အသုံးပြုခြင်း */}
                        <select
                            name="isAcceptingOrders"
                            defaultValue={settings?.isAcceptingOrders ? 'true' : 'false'}
                            className={`text-sm font-bold p-3 rounded-xl border focus:outline-none transition-colors cursor-pointer ${
                                settings?.isAcceptingOrders 
                                ? 'bg-green-500/20 border-green-500/50 text-green-300 focus:border-green-400' 
                                : 'bg-red-500/20 border-red-500/50 text-red-300 focus:border-red-400'
                            }`}
                        >
                            <option value="true" className="bg-gray-50 text-green-600">🟢 ဆိုင်ဖွင့်မည် (Accept Orders)</option>
                            <option value="false" className="bg-gray-50 text-red-600">🛑 ဆိုင်ပိတ်မည် (Pause Orders)</option>
                        </select>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

                    {/* အခြေခံ အချက်အလက်များ */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">ဆိုင်အမည် (Restaurant Name)</label>
                            <input
                                type="text"
                                name="restaurantName"
                                defaultValue={settings?.restaurantName || 'မြန်မာ့ရသာ'}
                                className="w-full bg-white border border-gray-300 rounded-xl p-4 text-gray-800 focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* သိမ်းဆည်းမည့် ခလုတ် */}
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-gray-800 hover:to-gray-500 text-black text-sm font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2">
                            <span>🔄</span> ဆက်တင်များ သိမ်းဆည်းမည်
                        </button>
                    </div>

                </form>
            </div>

            {/* Trash Section */}
            <TrashSection deletedItems={deletedItems} />
        </div>
    )
}