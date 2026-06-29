// app/(dashboard)/page.tsx
import React from 'react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">ယနေ့ အရောင်းအကျဉ်းချုပ်</h2>
        <p className="text-sm text-gray-500">သင့်ဆိုင်၏ လက်ရှိအရောင်းနှင့် အော်ဒါအခြေအနေများ</p>
      </div>

      {/* Analytics Cards များ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-400">စုစုပေါင်း အရောင်းရငွေ</span>
          <span className="text-2xl font-bold text-slate-800 mt-2">၃၅၀,၀၀၀ ကျပ်</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-400">အော်ဒါအသစ် (Pending)</span>
          <span className="text-2xl font-bold text-orange-500 mt-2">၅ စောင်</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-400">ချက်ပြုတ်ဆဲ (Cooking)</span>
          <span className="text-2xl font-bold text-blue-500 mt-2">၃ ပွဲ</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-400">ပြီးစီးပြီး အော်ဒါများ</span>
          <span className="text-2xl font-bold text-green-500 mt-2">၁၂ စောင်</span>
        </div>
      </div>

      {/* အောက်ခြေ နေရာလွတ် (နောင်တွင် ဇယားများထည့်ရန်) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400 text-sm">
        လတ်တလော အရောင်းဂရပ်ဖ် သို့မဟုတ် မကြာသေးမီက မှာယူမှုဇယားကို ဤနေရာတွင် ပြသပါမည်။
      </div>
    </div>
  )
}