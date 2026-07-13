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
    items: { menuItemId: string, quantity: number, addons?: { addonId: string, price: number }[] }[];
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
            const menuPrice = menu?.price || 0
            const addonsPrice = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0
            const itemTotal = (menuPrice + addonsPrice) * item.quantity
            totalAmount += itemTotal

            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: menuPrice,
                addons: item.addons && item.addons.length > 0 ? {
                    create: item.addons.map(a => ({ addonId: a.addonId }))
                } : undefined
            }
        })

        const taxAmount = totalAmount * 0.05 // 5% tax example (can be 0)
        const finalAmount = totalAmount + taxAmount

        const newOrder = await prisma.order.create({
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
        return { success: true, order: newOrder }
    } catch (error) {
        console.error("Error creating POS order:", error)
        return { success: false, error: "အော်ဒါတင်၍မရပါ၊ ပြန်လည်ကြိုးစားပေးပါ" }
    }
}

// ==========================================
// 🚀 Table-Based POS (Option 2) Actions
// ==========================================

export async function getActiveTableOrder(tableId: string) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    try {
        const activeOrder = await prisma.order.findFirst({
            where: {
                tableId,
                branchId: session.user.branchId,
                status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY'] }
            },
            include: {
                items: {
                    include: { 
                        menuItem: true,
                        addons: { include: { addon: true } }
                    }
                }
            }
        })
        return { success: true, data: activeOrder }
    } catch (error) {
        return { success: false, error: "Error fetching active order" }
    }
}

export async function sendOrderToKitchen(data: {
    orderId?: string; // If undefined, create new. If string, append items.
    branchId: string;
    tableId: string | null;
    items: { menuItemId: string, quantity: number, addons?: { addonId: string, price: number }[] }[];
}) {
    const session = await auth()
    if (!session?.user?.branchId || session.user.branchId !== data.branchId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Fetch prices to calculate total
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: data.items.map(i => i.menuItemId) } }
        })

        let addedAmount = 0
        const orderItemsData = data.items.map(item => {
            const menu = menuItems.find(m => m.id === item.menuItemId)
            const menuPrice = menu?.price || 0
            const addonsPrice = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0
            const itemTotal = (menuPrice + addonsPrice) * item.quantity
            addedAmount += itemTotal

            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: menuPrice,
                addons: item.addons && item.addons.length > 0 ? {
                    create: item.addons.map(a => ({ addonId: a.addonId }))
                } : undefined
            }
        })

        let finalOrderId = data.orderId

        if (data.orderId) {
            // Append to existing order
            const existingOrder = await prisma.order.findUnique({ where: { id: data.orderId } })
            if (!existingOrder) return { success: false, error: "Order not found" }

            const newTotalAmount = existingOrder.totalAmount + addedAmount
            const newTaxAmount = newTotalAmount * 0.05
            const newFinalAmount = newTotalAmount + newTaxAmount

            await prisma.order.update({
                where: { id: data.orderId },
                data: {
                    totalAmount: newTotalAmount,
                    taxAmount: newTaxAmount,
                    finalAmount: newFinalAmount,
                    items: {
                        create: orderItemsData
                    }
                }
            })
        } else {
            // Create new order
            const taxAmount = addedAmount * 0.05
            const finalAmount = addedAmount + taxAmount

            const newOrder = await prisma.order.create({
                data: {
                    branchId: data.branchId,
                    tableId: data.tableId,
                    status: 'PENDING',
                    totalAmount: addedAmount,
                    taxAmount: taxAmount,
                    finalAmount: finalAmount,
                    items: {
                        create: orderItemsData
                    }
                }
            })
            finalOrderId = newOrder.id
        }

        revalidatePath('/pos')
        revalidatePath('/dashboard/store/orders')
        return { success: true, orderId: finalOrderId }
    } catch (error) {
        console.error("Error sending order to kitchen:", error)
        return { success: false, error: "အော်ဒါတင်၍မရပါ" }
    }
}

export async function checkoutOrder(orderId: string, paymentMethod: string = 'CASH') {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId, branchId: session.user.branchId },
            include: { items: { include: { menuItem: true } } }
        })

        if (!order) return { success: false, error: "Order not found" }

        // Change status to delivered/paid (Depending on your flow, DELIVERED is usually end state for Orders)
        // Also we could create an Invoice here, but let's just mark it DELIVERED for POS completion.
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'DELIVERED' },
            include: { items: { include: { menuItem: true } } }
        })

        revalidatePath('/pos')
        revalidatePath('/dashboard/store/orders')
        return { success: true, order: updatedOrder }
    } catch (error) {
        console.error("Error in checkout:", error)
        return { success: false, error: "ဘေလ်ရှင်း၍မရပါ" }
    }
}