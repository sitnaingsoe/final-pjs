import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Order history ကို paginated ဖြင့် ယူခြင်း
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const branchId = searchParams.get('branchId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        if (!branchId) {
            return NextResponse.json(
                { success: false, error: "branchId is required" },
                { status: 400 }
            )
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: {
                    branchId,
                    status: { in: ['PAID', 'DELIVERED', 'CANCELLED'] },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    totalAmount: true,
                    taxAmount: true,
                    finalAmount: true,
                    items: true,
                    notes: true,
                    createdAt: true,
                    table: {
                        select: { number: true }
                    },
                    invoice: {
                        select: {
                            invoiceNumber: true,
                            paymentMethod: true,
                            paymentStatus: true,
                            discountAmount: true,
                        }
                    }
                }
            }),
            prisma.order.count({
                where: {
                    branchId,
                    status: { in: ['PAID', 'DELIVERED', 'CANCELLED'] },
                }
            })
        ])

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error("Order History API Error:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
