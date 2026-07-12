// server/actions/orders.ts
'use server'
import { OrderStatus } from '../../prisma/generated/enums'
import { prisma } from "@/lib/db";
import { revalidatePath } from 'next/cache'
import { auth } from "@/auth"

// ၁။ Database ထဲမှ အော်ဒါအားလုံးကို ဆွဲထုတ်ယူသည့် ဖန်ရှင်
export async function getOrders() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    try {
        const orders = await prisma.order.findMany({
            where: { branchId: session.user.branchId },
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
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.order.update({
            where: { id: orderId, branchId: session.user.branchId },
            data: { status: newStatus }
        })

        revalidatePath('/dashboard/store/orders')
        return { success: true }
    } catch (error) {
        console.error("Error updating order status:", error)
        return { success: false, error: "အော်ဒါအခြေအနေ ပြောင်းလဲ၍မရပါ" }
    }
}

// ၃။ POS မှတဆင့် အော်ဒါအသစ်တင်ခြင်း
export async function createPosOrder(data: {
    branchId: string;
    tableId: string | null;
    items: { menuItemId: string, quantity: number }[];
}) {
    const session = await auth()
    if (!session?.user?.branchId || session.user.branchId !== data.branchId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Fetch prices to calculate total on the server side
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: data.items.map(i => i.menuItemId) } }
        })

        let totalAmount = 0
        const orderItemsData = data.items.map(item => {
            const menu = menuItems.find(m => m.id === item.menuItemId)
            const price = menu?.price || 0
            totalAmount += price * item.quantity
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: price
            }
        })

        const taxAmount = totalAmount * 0.05 // 5% tax example (can be 0)
        const finalAmount = totalAmount + taxAmount

        await prisma.order.create({
            data: {
                branchId: data.branchId,
                tableId: data.tableId,
                status: 'PENDING',
                totalAmount,
                taxAmount,
                finalAmount,
                items: {
                    create: orderItemsData
                }
            }
        })

        revalidatePath('/pos')
        revalidatePath('/dashboard/store/orders')
        return { success: true }
    } catch (error) {
        console.error("Error creating POS order:", error)
        return { success: false, error: "အော်ဒါတင်၍မရပါ၊ ပြန်လည်ကြိုးစားပေးပါ" }
    }
}