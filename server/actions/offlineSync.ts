'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

function generateInvoiceNumber() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const date = new Date();
    const prefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    return `INV-${prefix}-${random}`;
}

export async function syncOfflineTransactions(transactions: any[]) {
    const session = await auth()
    if (!session?.user?.branchId || transactions.length === 0) {
        return { success: false, error: "Unauthorized or empty data" }
    }

    const branchId = session.user.branchId

    try {
        let syncedCount = 0;
        const failedOrders: any[] = [];

        // Process each transaction sequentially to ensure data integrity
        for (const txn of transactions) {
            try {
                // Ensure branch matches
                if (txn.branchId !== branchId) throw new Error("Branch mismatch");

                await prisma.$transaction(async (tx) => {
                    // 1. Create Invoice
                    const invoice = await tx.invoice.create({
                        data: {
                            invoiceNumber: generateInvoiceNumber(),
                            paymentMethod: 'CASH', // Default to CASH for offline
                            paymentStatus: 'PAID',
                            subTotal: txn.totalAmount,
                            taxAmount: txn.taxAmount,
                            discountAmount: txn.discountAmount || 0,
                            finalAmount: txn.finalAmount,
                            branchId: branchId,
                            createdAt: new Date(txn.createdAt) // Use the original offline time
                        }
                    })

                    // 2. Create Order & OrderItems
                    await tx.order.create({
                        data: {
                            branchId: branchId,
                            tableId: txn.tableId || null,
                            status: 'PAID', // Directly PAID since it's an offline checkout
                            totalAmount: txn.totalAmount,
                            taxAmount: txn.taxAmount,
                            finalAmount: txn.finalAmount,
                            invoiceId: invoice.id,
                            createdAt: new Date(txn.createdAt),
                            items: txn.items.map((item: any) => ({
                                menuItemId: item.menuItemId,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                addons: item.addons || []
                            }))
                        }
                    })

                    // 3. Update PromoCode Usage if any
                    if (txn.promoCode) {
                        const promo = await tx.promoCode.findFirst({
                            where: { code: txn.promoCode, branchId }
                        })
                        if (promo) {
                            await tx.promoCode.update({
                                where: { id: promo.id },
                                data: { usedCount: { increment: 1 } }
                            })
                        }
                    }
                })

                syncedCount++;
            } catch (err) {
                console.error("Failed to sync offline transaction:", txn.id, err);
                failedOrders.push(txn);
            }
        }

        revalidatePath('/dashboard/store/orders')
        revalidatePath('/dashboard/store/invoices')
        revalidatePath('/dashboard/hq')
        revalidatePath('/pos')

        return { 
            success: true, 
            syncedCount,
            failedOrders
        }

    } catch (error) {
        console.error("Bulk sync error:", error)
        return { success: false, error: "Server error during synchronization" }
    }
}
