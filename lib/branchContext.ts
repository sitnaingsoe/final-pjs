// lib/branchContext.ts
import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function getEffectiveBranchId(): Promise<string | null> {
    const session = await auth()
    if (!session?.user) return null

    // 1. Regular branch staff / admin
    if (session.user.branchId) {
        return session.user.branchId
    }

    // 2. Company Head viewing a branch
    if (session.user.role === 'COMPANY_HEAD') {
        const cookieStore = await cookies()
        const cookieBranchId = cookieStore.get('active_branch_id')?.value

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true, branch: { select: { companyId: true } } }
        })
        const companyId = currentUser?.companyId || currentUser?.branch?.companyId
        if (!companyId) return null

        if (cookieBranchId) {
            const branch = await prisma.branch.findFirst({
                where: { id: cookieBranchId, companyId },
                select: { id: true }
            })
            if (branch) return branch.id
        }

        // Default to first branch if no cookie set
        const firstBranch = await prisma.branch.findFirst({
            where: { companyId },
            select: { id: true }
        })
        return firstBranch?.id || null
    }

    return null
}

export async function getActiveBranchInfo() {
    const session = await auth()
    if (!session?.user) return null

    const isCompanyHead = session.user.role === 'COMPANY_HEAD'

    if (isCompanyHead) {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { companyId: true, branch: { select: { companyId: true } } }
        })
        const companyId = currentUser?.companyId || currentUser?.branch?.companyId
        if (!companyId) return null

        const branches = await prisma.branch.findMany({
            where: { companyId },
            select: { id: true, name: true }
        })

        const cookieStore = await cookies()
        const activeBranchId = cookieStore.get('active_branch_id')?.value || branches[0]?.id

        const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0]

        return {
            branchId: activeBranch?.id || null,
            branchName: activeBranch?.name || '',
            branches,
            isOwnerImpersonating: true
        }
    }

    if (session.user.branchId) {
        const branch = await prisma.branch.findUnique({
            where: { id: session.user.branchId },
            select: { id: true, name: true }
        })
        return {
            branchId: branch?.id || null,
            branchName: branch?.name || '',
            branches: branch ? [branch] : [],
            isOwnerImpersonating: false
        }
    }

    return null
}
