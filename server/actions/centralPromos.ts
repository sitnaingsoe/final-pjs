// server/actions/centralPromos.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getCentralCampaigns() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized: Only Company Head can view central campaigns' }
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true, branch: { select: { companyId: true } } }
        })
        const companyId = currentUser?.companyId || currentUser?.branch?.companyId
        if (!companyId) return { success: false, error: 'No company found' }

        const branches = await prisma.branch.findMany({
            where: { companyId },
            select: { id: true, name: true }
        })

        const branchIds = branches.map(b => b.id)

        // Fetch all promo codes belonging to this company's branches
        const allPromos = await prisma.promoCode.findMany({
            where: { branchId: { in: branchIds } },
            include: {
                branch: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Group promos by uppercase code
        const campaignMap = new Map<string, {
            code: string
            discountType: string
            discountValue: number
            minOrderAmount: number | null
            maxUsageLimit: number | null
            totalUsedCount: number
            expiryDate: Date | null
            isActive: boolean
            createdAt: Date
            branches: Array<{ id: string; name: string; usedCount: number; promoId: string; isActive: boolean }>
        }>()

        allPromos.forEach(p => {
            const key = p.code.toUpperCase()
            const branchName = p.branch?.name || 'Branch'
            const branchId = p.branch?.id || p.branchId || ''

            if (!campaignMap.has(key)) {
                campaignMap.set(key, {
                    code: p.code,
                    discountType: p.discountType,
                    discountValue: p.discountValue,
                    minOrderAmount: p.minOrderAmount,
                    maxUsageLimit: p.maxUsageLimit,
                    totalUsedCount: p.usedCount,
                    expiryDate: p.expiryDate,
                    isActive: p.isActive,
                    createdAt: p.createdAt,
                    branches: [{
                        id: branchId,
                        name: branchName,
                        usedCount: p.usedCount,
                        promoId: p.id,
                        isActive: p.isActive
                    }]
                })
            } else {
                const existing = campaignMap.get(key)!
                existing.totalUsedCount += p.usedCount
                // If any branch promo is active, consider campaign active
                existing.isActive = existing.isActive || p.isActive
                existing.branches.push({
                    id: branchId,
                    name: branchName,
                    usedCount: p.usedCount,
                    promoId: p.id,
                    isActive: p.isActive
                })
            }
        })

        const campaigns = Array.from(campaignMap.values())

        return {
            success: true,
            data: {
                campaigns,
                branches
            }
        }
    } catch (error: any) {
        console.error('getCentralCampaigns error:', error)
        return { success: false, error: 'ကမ်ပိန်းများ ဆွဲယူရာတွင် အမှားရှိနေပါသည်: ' + (error?.message || '') }
    }
}

export async function createCentralCampaign(formData: FormData, targetBranchIds: string[]) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized' }
    }

    if (!targetBranchIds || targetBranchIds.length === 0) {
        return { success: false, error: 'အနည်းဆုံး ဆိုင်ခွဲ (၁) ခု ရွေးချယ်ပေးပါ' }
    }

    const code = (formData.get('code') as string || '').trim().toUpperCase()
    const discountType = formData.get('discountType') as string
    const discountValueStr = formData.get('discountValue') as string
    const minOrderAmountStr = formData.get('minOrderAmount') as string
    const maxUsageLimitStr = formData.get('maxUsageLimit') as string
    const expiryDateStr = formData.get('expiryDate') as string

    if (!code || !discountValueStr || !discountType) {
        return { success: false, error: 'ပရိုမိုကုဒ် နှင့် လျှော့စျေးပမာဏ ဖြည့်သွင်းပေးပါ' }
    }

    const discountValue = parseFloat(discountValueStr)
    const minOrderAmount = minOrderAmountStr ? parseFloat(minOrderAmountStr) : null
    const maxUsageLimit = maxUsageLimitStr ? parseInt(maxUsageLimitStr) : null
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true, branch: { select: { companyId: true } } }
        })
        const companyId = currentUser?.companyId || currentUser?.branch?.companyId
        if (!companyId) return { success: false, error: 'No company found' }

        // Verify all targetBranchIds belong to this company
        const validBranches = await prisma.branch.findMany({
            where: { id: { in: targetBranchIds }, companyId },
            select: { id: true }
        })
        const validIds = validBranches.map(b => b.id)

        let createdCount = 0

        // Create or update PromoCode for each target branch
        for (const bId of validIds) {
            // Check if promo with this code exists in this branch
            const existing = await prisma.promoCode.findFirst({
                where: { code, branchId: bId }
            })

            if (existing) {
                await prisma.promoCode.update({
                    where: { id: existing.id },
                    data: {
                        discountType,
                        discountValue,
                        minOrderAmount,
                        maxUsageLimit,
                        expiryDate,
                        isActive: true
                    }
                })
            } else {
                // If code is unique globally or per branch, create it
                await prisma.promoCode.create({
                    data: {
                        code,
                        discountType,
                        discountValue,
                        minOrderAmount,
                        maxUsageLimit,
                        expiryDate,
                        isActive: true,
                        branchId: bId
                    }
                })
            }
            createdCount++
        }

        revalidatePath('/dashboard/hq/campaigns')
        revalidatePath('/dashboard/store/promo-codes')
        return { success: true, count: createdCount }
    } catch (error: any) {
        console.error('createCentralCampaign error:', error)
        return { success: false, error: 'ကမ်ပိန်းဖန်တီးခြင်း မအောင်မြင်ပါ: ' + (error?.message || '') }
    }
}

export async function toggleCentralCampaign(code: string, isActive: boolean) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true, branch: { select: { companyId: true } } }
        })
        const companyId = currentUser?.companyId || currentUser?.branch?.companyId
        if (!companyId) return { success: false, error: 'No company found' }

        const companyBranches = await prisma.branch.findMany({
            where: { companyId },
            select: { id: true }
        })
        const branchIds = companyBranches.map(b => b.id)

        await prisma.promoCode.updateMany({
            where: { code: code.toUpperCase(), branchId: { in: branchIds } },
            data: { isActive }
        })

        revalidatePath('/dashboard/hq/campaigns')
        revalidatePath('/dashboard/store/promo-codes')
        return { success: true }
    } catch (error: any) {
        console.error('toggleCentralCampaign error:', error)
        return { success: false, error: 'ကမ်ပိန်း အခြေအနေ ပြောင်းလဲ၍မရပါ' }
    }
}

export async function deleteCentralCampaign(code: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY_HEAD') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true, branch: { select: { companyId: true } } }
        })
        const companyId = currentUser?.companyId || currentUser?.branch?.companyId
        if (!companyId) return { success: false, error: 'No company found' }

        const companyBranches = await prisma.branch.findMany({
            where: { companyId },
            select: { id: true }
        })
        const branchIds = companyBranches.map(b => b.id)

        await prisma.promoCode.deleteMany({
            where: { code: code.toUpperCase(), branchId: { in: branchIds } }
        })

        revalidatePath('/dashboard/hq/campaigns')
        revalidatePath('/dashboard/store/promo-codes')
        return { success: true }
    } catch (error: any) {
        console.error('deleteCentralCampaign error:', error)
        return { success: false, error: 'ကမ်ပိန်း ဖျက်ဆီးခြင်း မအောင်မြင်ပါ' }
    }
}
