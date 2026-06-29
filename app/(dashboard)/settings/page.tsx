// app/(dashboard)/settings/page.tsx
import React from 'react'
import { getRestaurantSettings, updateRestaurantSettings } from '@/server/actions/settings'

export default async function SettingsPage() {
    const result = await getRestaurantSettings()
    const settings = result.data

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">ဆိုင်အထွေထွေ ဆက်တင်များ (Restaurant Settings)</h2>
                <p className="text-sm text-gray-500">ဆိုင်၏ အချက်အလက်များနှင့် အွန်လိုင်းမှ အော်ဒါလက်ခံမည့် အခြေအနေကို ပြင်ဆင်ပါ</p>
            </div>

            {/* ပင်မ ဆက်တင်ဖောင်ကြီး */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <form
                    action={async (formData) => {
                        'use server'
                        await updateRestaurantSettings(formData)
                    }}
                    className="space-y-6"
                >
                    {/* ရှိပြီးသား Setting ID ကို Backend သို့ ခိုးပို့ရန် Hidden Input */}
                    <input type="hidden" name="id" value={settings?.id || ''} />

                    {/* ⚡ ဆိုင်ဖွင့်/ပိတ် ထိန်းချုပ်သည့် နေရာ (UX Status Box) */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between transition ${settings?.isAcceptingOrders ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">အွန်လိုင်း အော်ဒါစနစ် အခြေအနေ</h4>
                            <p className="text-xs text-gray-500 mt-0.5">လက်ရှိတွင် ကတ်စတမ်မာများ အော်ဒါမှာယူ၍ {settings?.isAcceptingOrders ? 'ရနေပါသည်' : 'မရသေးပါ'}</p>
                        </div>

                        {/* Native HTML Select အား Toggle Switch သဖွယ် အသုံးပြုခြင်း */}
                        <select
                            name="isAcceptingOrders"
                            defaultValue={settings?.isAcceptingOrders ? 'true' : 'false'}
                            className={`text-xs font-bold p-2 rounded-lg border bg-white focus:outline-none ${settings?.isAcceptingOrders ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'
                                }`}
                        >
                            <option value="true">🟢 ဆိုင်ဖွင့်မည် (Accept Orders)</option>
                            <option value="false">🛑 ဆိုင်ပိတ်မည် (Pause Orders)</option>
                        </select>
                    </div>

                    <hr className="border-gray-100" />

                    {/* အခြေခံ အချက်အလက်များ */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">ဆိုင်အမည် (Restaurant Name)</label>
                            <input
                                type="text"
                                name="restaurantName"
                                defaultValue={settings?.restaurantName || 'မြန်မာ့ရသာ'}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                    </div>

                    {/* သိမ်းဆည်းမည့် ခလုတ် */}
                    <div className="flex justify-end border-t pt-4">
                        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition">
                            🔄 ဆက်တင်များ ပြင်ဆင်သိမ်းဆည်းမည်
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}