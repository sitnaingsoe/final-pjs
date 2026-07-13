// server/actions/staff.ts
'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// 🔐 ၁။ ဝန်ထမ်း၏ Password ကို ဗဟိုမှ အတင်း Reset ချပေးမည့် Action
export async function resetStaffPassword(userId: number, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'COMPANY_HEAD') return { success: false, error: 'Unauthorized: Only Company Head can perform this action' }
    
    const companyId = session?.user?.companyId
    if (!companyId) return { success: false, error: "Unauthorized" }

    const newPassword = formData.get('newPassword') as string

    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "လျှို့ဝှက်နံပါတ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်" }
    }

    try {
        // Verify user belongs to a branch in this company
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { branch: true }
        })

        if (!user || user.branch?.companyId !== companyId) {
            return { success: false, error: "Unauthorized" }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })
        revalidatePath('/dashboard/hq/staff')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Password ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}

// 🚫 ၂။ ဝန်ထမ်းအကောင့်ကို ပိတ်ခြင်း/ပြန်ဖွင့်ခြင်း Action
export async function toggleStaffStatus(userId: number, currentStatus: boolean) {
    const session = await auth()
    if (session?.user?.role !== 'COMPANY_HEAD') return { success: false, error: 'Unauthorized: Only Company Head can perform this action' }
    
    const companyId = session?.user?.companyId
    if (!companyId) return { success: false, error: "Unauthorized" }

    try {
        // Verify user belongs to a branch in this company
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { branch: true }
        })

        if (!user || user.branch?.companyId !== companyId) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isActive: !currentStatus }
        })
        revalidatePath('/dashboard/hq/staff')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Status ပြောင်းလဲခြင်း မအောင်မြင်ပါ" }
    }
}

// ----------------------------------------------------------------------
// BRANCH_ADMIN အဆင့်အတွက် ဝန်ထမ်းစီမံခန့်ခွဲမှု (Store Dashboard)
// ----------------------------------------------------------------------

// ၁။ လက်ရှိ Admin ရဲ့ ဆိုင်ခွဲ (Branch) က ဝန်ထမ်းများကို ဆွဲထုတ်ခြင်း
export async function getStaffByBranch() {
    const session = await auth()
    if (!session?.user?.branchId || session.user.role === 'STAFF') return { success: false, error: "Unauthorized" }

    try {
        const staffs = await prisma.user.findMany({
            where: {
                branchId: session.user.branchId,
                role: 'STAFF'
            },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: staffs }
    } catch (error) {
        console.error("Error getting staff:", error)
        return { success: false, error: "ဝန်ထမ်းစာရင်း ဆွဲထုတ်ရာတွင် အမှားအယွင်းရှိပါသည်" }
    }
}

// ၂။ ဝန်ထမ်းအသစ် ဖန်တီးခြင်း
export async function createStaff(formData: FormData) {
    const session = await auth()
    if (!session?.user?.branchId || session.user.role === 'STAFF') {
        return { success: false, error: "Unauthorized" }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
        return { success: false, error: "လိုအပ်သော အချက်အလက်များ ပြည့်စုံစွာ ဖြည့်ပါ" }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return { success: false, error: "ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ထားပြီးသား ရှိနေပါသည်" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Retrieve the branch to get companyId
        const branch = await prisma.branch.findUnique({ where: { id: session.user.branchId } })

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'STAFF',
                branchId: session.user.branchId,
                companyId: branch?.companyId || null,
            }
        })

        revalidatePath('/dashboard/store/staff')
        return { success: true }
    } catch (error) {
        console.error("Error creating staff:", error)
        return { success: false, error: "ဝန်ထမ်းအသစ် ထည့်သွင်းရာတွင် အမှားအယွင်းရှိပါသည်" }
    }
}

// ၃။ ဝန်ထမ်းအခြေအနေ (Active / Inactive) ကို ပြောင်းလဲခြင်း (Branch Admin)
export async function toggleStaffStatusBranch(id: number, currentStatus: boolean) {
    const session = await auth()
    if (!session?.user?.branchId || session.user.role === 'STAFF') {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const staff = await prisma.user.findUnique({ where: { id } })
        if (!staff || staff.branchId !== session.user.branchId) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.user.update({
            where: { id },
            data: { isActive: !currentStatus }
        })

        revalidatePath('/dashboard/store/staff')
        return { success: true }
    } catch (error) {
        console.error("Error toggling staff status:", error)
        return { success: false, error: "အခြေအနေ ပြောင်းလဲရာတွင် အမှားအယွင်းရှိပါသည်" }
    }
}