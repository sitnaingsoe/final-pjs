// app/dashboard/company/menu/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CreateMenuDialog from '@/components/dashboard/CreateMenuDialog'
import MenuRowActions from '@/components/dashboard/MenuRowActions'

async function getMasterMenus(companyId: string) {
    return await prisma.menu.findMany({
        where: { companyId }, // 🎯 သက်ဆိုင်ရာ ကုမ္ပဏီ၏ မီနူးများကိုသာ ဆွဲထုတ်မည်
        include: {
            branches: {
                include: { branch: { select: { name: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function CentralMenuPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        redirect('/dashboard')
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { companyId: true, branch: { select: { companyId: true } } }
    })
    const companyId = currentUser?.companyId || currentUser?.branch?.companyId

    if (!companyId) {
        return <div className="p-6 text-center text-red-500">ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ။</div>
    }

    // ဆိုင်ခွဲစာရင်းနှင့် မီနူးစာရင်းများကို သက်ဆိုင်ရာ companyId ဖြင့်သာ ဆွဲထုတ်ခြင်း
    const branches = await prisma.branch.findMany({ 
        where: { companyId }, 
        select: { id: true, name: true } 
    })
    const menus = await getMasterMenus(companyId)

    return (
        <div className="space-y-6 text-black min-h-screen">

            {/* Header + Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-wider text-black">🍔 Master Menu Catalog</h1>
                    <p className="text-xs text-gray-500 mt-0.5">ဗဟိုမှ ဟင်းပွဲ/မီနူးအသစ်များ သတ်မှတ်ခြင်းနှင့် ဆိုင်ခွဲများသို့ ဖြန့်ဝေခြင်း</p>
                </div>

                {/* Reusable Dialog Box ကို ဆိုင်ခွဲစာရင်းပတ်ပြီး ခေါ်သုံးမည် */}
                <CreateMenuDialog branches={branches} />
            </div>

            {/* Master Menu List Table */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold uppercase text-gray-700">Global Menu Items ({menus.length})</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 text-2xs uppercase font-bold text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="p-3">Image</th>
                                <th className="p-3">Menu Item</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Standard Price</th>
                                <th className="p-3">Active Branches (ရောင်းချနေသည့်ဆိုင်များ)</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {menus.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400">
                                        ဗဟိုတွင် မည်သည့် မီနူးပစ္စည်းမျှ မဆောက်ရသေးပါ။ အပေါ်က ခလုတ်ကို နှိပ်၍ အသစ်ဆောက်ပါ။
                                    </td>
                                </tr>
                            ) : (
                                menus.map((menu) => (
                                    <tr key={menu.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-3">
                                            {menu.image ? (
                                                <img src={menu.image} alt={menu.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs border border-gray-200">No Img</div>
                                            )}
                                        </td>
                                        <td className="p-3 font-bold text-gray-900 text-sm">{menu.name}</td>
                                        <td className="p-3 text-gray-500 max-w-xs truncate">{menu.description || '-'}</td>
                                        <td className="p-3 text-right font-mono font-bold text-gray-900 text-sm">{menu.basePrice.toLocaleString()} MMK</td>
                                        <td className="p-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {menu.branches.length === 0 ? (
                                                    <span className="text-3xs text-gray-400 italic">မည်သည့်ဆိုင်မျှ မဖြန့်ရသေးပါ</span>
                                                ) : (
                                                    menu.branches.map((b: any) => (
                                                        <span key={b.branchId} className="bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-3xs font-semibold">
                                                            📍 {b.branch.name}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider border ${menu.isActive
                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                : 'bg-red-50 border-red-200 text-red-700'
                                                }`}>
                                                {menu.isActive ? 'Active' : 'Archived'}
                                            </span>
                                        </td>
                                        {/* 🎯 Edit & Toggle Actions ခလုတ်များ */}
                                        <td className="p-3 text-center">
                                            <MenuRowActions menu={menu} branches={branches} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}