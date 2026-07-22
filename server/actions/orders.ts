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

// ၃။ POS မှတဆင့် အော်ဒါအသစ်တင်ခြင်း (JSON items)
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
        // Fetch prices and names to calculate total on the server side
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
                name: menu?.name || "Unknown Item",
                quantity: item.quantity,
                price: menuPrice,
                addons: item.addons || []
            }
        })

        const taxAmount = totalAmount * 0.05
        const finalAmount = totalAmount + taxAmount

        const newOrder = await prisma.order.create({
            data: {
                branchId: data.branchId,
                tableId: data.tableId,
                status: 'PENDING',
                totalAmount,
                taxAmount,
                finalAmount,
                items: orderItemsData
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
                status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'DELIVERED'] }
            }
        })
        return { success: true, data: activeOrder }
    } catch (error) {
        return { success: false, error: "Error fetching active order" }
    }
}

export async function getPendingBillRequests(branchId: string) {
    const session = await auth()
    if (!session?.user?.branchId || session.user.branchId !== branchId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const requests = await prisma.order.findMany({
            where: {
                branchId,
                isBillRequested: true,
                status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'DELIVERED'] }
            },
            include: { table: true },
            orderBy: { updatedAt: 'asc' }
        })
        return { success: true, data: requests }
    } catch (error) {
        return { success: false, error: "Error fetching bill requests" }
    }
}

export async function sendOrderToKitchen(data: {
    orderId?: string;
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
                name: menu?.name || "Unknown Item",
                quantity: item.quantity,
                price: menuPrice,
                addons: item.addons || []
            }
        })

        let finalOrderId = data.orderId

        if (data.orderId) {
            // Append to existing order items JSON array
            const existingOrder = await prisma.order.findUnique({ where: { id: data.orderId } })
            if (!existingOrder) return { success: false, error: "Order not found" }

            const existingItems = (existingOrder.items as any[]) || []
            const newItems = [...existingItems, ...orderItemsData]

            const newTotalAmount = existingOrder.totalAmount + addedAmount
            const newTaxAmount = newTotalAmount * 0.05
            const newFinalAmount = newTotalAmount + newTaxAmount

            await prisma.order.update({
                where: { id: data.orderId },
                data: {
                    totalAmount: newTotalAmount,
                    taxAmount: newTaxAmount,
                    finalAmount: newFinalAmount,
                    items: newItems
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
                    items: orderItemsData
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
            where: { id: orderId, branchId: session.user.branchId }
        })

        if (!order) return { success: false, error: "Order not found" }

        // Generate unique invoice number
        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        
        // 1. Create a separate Invoice record
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                paymentMethod,
                paymentStatus: 'PAID',
                subTotal: order.totalAmount,
                taxAmount: order.taxAmount,
                finalAmount: order.finalAmount,
                branchId: session.user.branchId
            }
        })

        // 2. Link Invoice to Order and set status to PAID
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
                status: 'PAID',
                invoiceId: invoice.id
            }
        })

        revalidatePath('/pos')
        revalidatePath('/dashboard/store/orders')
        return { success: true, order: updatedOrder }
    } catch (error) {
        console.error("Error in checkout:", error)
        return { success: false, error: "ဘေလ်ရှင်း၍မရပါ" }
    }
}