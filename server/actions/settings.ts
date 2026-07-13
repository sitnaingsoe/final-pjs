// server/actions/settings.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getRestaurantSettings() {
    try {
        const settings = await prisma.setting.findFirst()
        return { success: true, data: settings }
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

    const id = formData.get('id') as string // ရှိပြီးသားဆိုရင် id ပါလာမည်
    const restaurantName = formData.get('restaurantName') as string
    const isAcceptingOrders = formData.get('isAcceptingOrders') === 'true'

    try {
        await prisma.setting.upsert({
            where: { branchId },
            update: { restaurantName, isAcceptingOrders },
            create: { id: id || undefined, restaurantName, isAcceptingOrders, branchId }
        })

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "ဆက်တင်များ ပြင်ဆင်သိမ်းဆည်း၍ မရပါ" }
    }
}