// server/actions/orders.ts
'use server'
import { OrderStatus } from '../../prisma/generated/enums'
import { prisma } from "@/lib/db";
import { revalidatePath } from 'next/cache'

// ၁။ Database ထဲမှ အော်ဒါအားလုံးကို ဆွဲထုတ်ယူသည့် ဖန်ရှင်
export async function getOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        menuItem: true,
                        addons: {
                            include: {
                                addon: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc' // နောက်ဆုံးမှာတဲ့အော်ဒါကို အပေါ်ဆုံးကပြမည်
            }
        })
        return { success: true, data: orders }
    } catch (error) {
        console.error("Error fetching orders:", error)
        return { success: false, error: "အော်ဒါများ ဆွဲထုတ်ရယူ၍မရပါ" }
    }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        })

        revalidatePath('/orders')
        return { success: true }
    } catch (error) {
        console.error("Error updating order status:", error)
        return { success: false, error: "အော်ဒါအခြေအနေ ပြောင်းလဲ၍မရပါ" }
    }
}