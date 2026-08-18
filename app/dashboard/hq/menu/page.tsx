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
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 glass rounded-[2rem] border border-border/50 shadow-2xl relative z-50">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Main Menu Catalog</h1>

                    </div>
                </div>
                <div className="shrink-0">
                    <CreateMenuDialog branches={branches} />
                </div>
            </div>

            {/* Main Menu List Table */}
            <div className="glass rounded-[2rem] shadow-2xl">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                    </div>
                    <h2 className="text-base font-black uppercase tracking-wider text-foreground">Global Menu Items <span className="font-bold text-muted-foreground tracking-normal ml-1 text-sm">({menus.length})</span></h2>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-foreground min-w-[1000px]">
                        <thead className="text-xs uppercase font-black tracking-widest text-muted-foreground border-b border-border/50">
                            <tr>
                                <th className="pb-4 pl-4 font-black">Image</th>
                                <th className="pb-4 font-black">Menu Item</th>
                                <th className="pb-4 font-black">Description</th>
                                <th className="pb-4 text-right font-black">Standard Price</th>
                                <th className="pb-4 font-black pl-8">Active Branches (ရောင်းချနေသည့်ဆိုင်များ)</th>
                                <th className="pb-4 text-center font-black">Status</th>
                                <th className="pb-4 text-right font-black pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {menus.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/50 mb-4 border border-dashed border-border">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                                            </div>
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">No Menu Items Found</h3>
                                            <p className="text-xs text-muted-foreground font-bold">ဗဟိုတွင် မည်သည့် မီနူးပစ္စည်းမျှ မဆောက်ရသေးပါ။ အပေါ်က ခလုတ်ကို နှိပ်၍ အသစ်ဆောက်ပါ။</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                menus.map((menu) => (
                                    <tr key={menu.id} className="hover:bg-black/5 transition-colors group">
                                        <td className="py-4 pl-4">
                                            {menu.image ? (
                                                <img src={menu.image} alt={menu.name} className="w-12 h-12 object-cover rounded-xl border border-border shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 font-bold text-foreground text-base">{menu.name}</td>
                                        <td className="py-4 text-muted-foreground max-w-xs pr-4 font-medium">
                                            <div className="line-clamp-2">{menu.description || '-'}</div>
                                        </td>
                                        <td className="py-4 text-right font-black text-foreground">{menu.basePrice.toLocaleString()} <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">MMK</span></td>
                                        <td className="py-4 pl-8">
                                            <div className="flex flex-wrap gap-2">
                                                {menu.branches.length === 0 ? (
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">မည်သည့်ဆိုင်မျှ မဖြန့်ရသေးပါ</span>
                                                ) : (
                                                    menu.branches.map((b: any) => (
                                                        <span key={b.branchId} className="bg-card border border-border text-muted-foreground px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                                            {b.branch.name}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                menu.isActive 
                                                ? 'bg-green-50 text-green-700' 
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${menu.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {menu.isActive ? 'Active' : 'Archived'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-4">
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