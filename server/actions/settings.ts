// server/actions/settings.ts
'use server'

import { prisma } from '@/lib/db'
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
    const id = formData.get('id') as string // ရှိပြီးသားဆိုရင် id ပါလာမည်
    const restaurantName = formData.get('restaurantName') as string
    const isAcceptingOrders = formData.get('isAcceptingOrders') === 'true' // Checkbox သို့မဟုတ် Hidden Input မှ String ကို Boolean ပြောင်းခြင်း

    try {
        await prisma.setting.upsert({
            where: { id: id || 'default-settings-id' },
            update: { restaurantName, isAcceptingOrders, },
            create: { id: 'default-settings-id', restaurantName, isAcceptingOrders }
        })

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "ဆက်တင်များ ပြင်ဆင်သိမ်းဆည်း၍ မရပါ" }
    }
}