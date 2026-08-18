import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getActiveBranchInfo } from '@/lib/branchContext'
import StoreViewBanner from '@/components/dashboard/StoreViewBanner'

export default async function StoreDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // အကောင့်မဝင်ထားလျှင် သို့မဟုတ် Session မရှိလျှင် Login သို့ ပို့မည်
    if (!session?.user) {
        redirect('/login')
    }

    const { role } = session.user

    // 🎯 လုံခြုံရေး အဆင့် - STAFF များကို Admin Dashboard ပေးမဝင်ဘဲ POS ဆီသို့ အတင်းမောင်းထုတ်မည်
    if (role === 'STAFF') {
        redirect('/pos')
    }

    const branchInfo = await getActiveBranchInfo()

    return (
        <div className="space-y-6">
            {branchInfo?.isOwnerImpersonating && branchInfo.branchId && (
                <StoreViewBanner
                    currentBranchId={branchInfo.branchId}
                    currentBranchName={branchInfo.branchName}
                    branches={branchInfo.branches}
                />
            )}
            {children}
        </div>
    )
}
