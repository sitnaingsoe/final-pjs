// server/actions/settings.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getRestaurantSettings() {
    const session = await auth()
    const branchId = session?.user?.branchId
    if (!branchId) return { success: false, error: "Unauthorized: No branch linked to user" }

    try {
        const branch = await prisma.branch.findUnique({
            where: { id: branchId },
            select: {
                id: true,
                restaurantName: true,
                isAcceptingOrders: true,
                currency: true,
                taxRate: true
            }
        })
        return { success: true, data: branch }
    } catch (error) {
        console.error("Error fetching settings:", error)
        return { success: false, error: "ဆက်တင်များ ဆွဲထုတ်၍ မရပါ" }
    }
}

export async function updateRestaurantSettings(formData: FormData) {
    const session = await auth()
    if (session?.user?.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot perform this action." }

    const branchId = session?.user?.branchId
    if (!branchId) return { success: false, error: "Unauthorized" }

    const restaurantName = formData.get('restaurantName') as string
    const isAcceptingOrders = formData.get('isAcceptingOrders') === 'true'

    try {
        await prisma.branch.update({
            where: { id: branchId },
            data: { restaurantName, isAcceptingOrders }
        })

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "ဆက်တင်များ ပြင်ဆင်သိမ်းဆည်း၍ မရပါ" }
    }
}