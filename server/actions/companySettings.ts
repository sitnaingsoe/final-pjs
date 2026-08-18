// server/actions/companySettings.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function getCompanySettings() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized: Only Company Head can view company settings' }
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                companyId: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        _count: {
                            select: {
                                branches: true,
                                users: true,
                                menus: true
                            }
                        }
                    }
                }
            }
        })

        if (!currentUser?.company) {
            return { success: false, error: 'ကုမ္ပဏီအချက်အလက် ရှာမတွေ့ပါ' }
        }

        const companyId = currentUser.company.id

        // Calculate company total revenue and branch statistics
        const [revenueAgg, branches] = await Promise.all([
            prisma.invoice.aggregate({
                where: { branch: { companyId }, paymentStatus: 'PAID' },
                _sum: { finalAmount: true }
            }),
            prisma.branch.findMany({
                where: { companyId },
                select: { id: true, name: true, currency: true, taxRate: true, isAcceptingOrders: true }
            })
        ])

        return {
            success: true,
            data: {
                owner: {
                    id: currentUser.id,
                    name: currentUser.name || '',
                    email: currentUser.email
                },
                company: {
                    id: currentUser.company.id,
                    name: currentUser.company.name,
                    createdAt: currentUser.company.createdAt,
                    branchCount: currentUser.company._count.branches,
                    staffCount: currentUser.company._count.users,
                    menuCount: currentUser.company._count.menus,
                    totalRevenue: revenueAgg._sum.finalAmount || 0,
                    branches
                }
            }
        }
    } catch (error: any) {
        console.error('getCompanySettings error:', error)
        return { success: false, error: 'ဆက်တင်များ ဆွဲယူရာတွင် အမှားရှိနေပါသည်: ' + (error?.message || '') }
    }
}

export async function updateCompanyName(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized' }
    }

    const companyName = formData.get('companyName') as string
    if (!companyName || companyName.trim().length === 0) {
        return { success: false, error: 'ကုမ္ပဏီအမည် ဖြည့်သွင်းပေးပါ' }
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true }
        })

        if (!currentUser?.companyId) {
            return { success: false, error: 'ကုမ္ပဏီ ID မရှိပါ' }
        }

        await prisma.company.update({
            where: { id: currentUser.companyId },
            data: { name: companyName.trim() }
        })

        revalidatePath('/dashboard/hq/settings')
        revalidatePath('/dashboard/hq')
        return { success: true }
    } catch (error: any) {
        console.error('updateCompanyName error:', error)
        return { success: false, error: 'ကုမ္ပဏီအမည် ပြင်ဆင်ခြင်း မအောင်မြင်ပါ' }
    }
}

export async function updateOwnerProfile(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    if (!name || name.trim().length === 0) {
        return { success: false, error: 'အမည် ဖြည့်သွင်းပေးပါ' }
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email! },
            data: { name: name.trim() }
        })

        revalidatePath('/dashboard/hq/settings')
        return { success: true }
    } catch (error: any) {
        console.error('updateOwnerProfile error:', error)
        return { success: false, error: 'ပရိုဖိုင် ပြင်ဆင်ခြင်း မအောင်မြင်ပါ' }
    }
}

export async function updateOwnerPassword(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized' }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, error: 'စကားဝှက် အချက်အလက်များ အားလုံး ဖြည့်သွင်းပေးပါ' }
    }

    if (newPassword.length < 6) {
        return { success: false, error: 'စကားဝှက်အသစ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်' }
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: 'စကားဝှက်အသစ်နှင့် အတည်ပြုစကားဝှက် မကိုက်ညီပါ' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        })

        if (!user) {
            return { success: false, error: 'အသုံးပြုသူ ရှာမတွေ့ပါ' }
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return { success: false, error: 'လက်ရှိ စကားဝှက် မှားယွင်းနေပါသည်' }
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        })

        return { success: true }
    } catch (error: any) {
        console.error('updateOwnerPassword error:', error)
        return { success: false, error: 'စကားဝှက် ပြောင်းလဲခြင်း မအောင်မြင်ပါ' }
    }
}

export async function bulkSyncBranchPolicies(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized' }
    }

    const taxRateStr = formData.get('taxRate') as string
    const currency = (formData.get('currency') as string) || 'MMK'

    const taxRate = parseFloat(taxRateStr)
    if (isNaN(taxRate) || taxRate < 0) {
        return { success: false, error: 'အခွန်နှုန်းထား မှန်ကန်စွာ ဖြည့်သွင်းပေးပါ' }
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true }
        })

        if (!currentUser?.companyId) {
            return { success: false, error: 'ကုမ္ပဏီ ID မရှိပါ' }
        }

        // Bulk update all branches belonging to this company
        const updateResult = await prisma.branch.updateMany({
            where: { companyId: currentUser.companyId },
            data: {
                taxRate,
                currency
            }
        })

        revalidatePath('/dashboard/hq/settings')
        revalidatePath('/dashboard/hq/branches')
        return { success: true, count: updateResult.count }
    } catch (error: any) {
        console.error('bulkSyncBranchPolicies error:', error)
        return { success: false, error: 'ဆိုင်ခွဲမူဝါဒများ Sync လုပ်ခြင်း မအောင်မြင်ပါ' }
    }
}
