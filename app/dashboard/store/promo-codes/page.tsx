import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import PromoCodeManager from '@/components/dashboard/PromoCodeManager'
import { getEffectiveBranchId } from '@/lib/branchContext'

export default async function PromoCodesPage() {
    const session = await auth()
    if (!session?.user) {
        redirect('/login')
    }

    const branchId = await getEffectiveBranchId()
    if (!branchId) {
        redirect('/dashboard/hq')
    }

    const promoCodes = await prisma.promoCode.findMany({
        where: { branchId },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Page Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 glass ">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Promo Codes</h1>

                    </div>
                </div>
            </div>
            
            <PromoCodeManager branchId={branchId} promoCodes={promoCodes} />
        </div>
    )
}
