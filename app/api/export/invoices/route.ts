// app/api/export/invoices/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: Request) {
    const session = await auth()
    
    // Check if the user is authenticated and has a branchId
    if (!session?.user?.branchId) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // Fetch all invoices for the branch
        const invoices = await prisma.invoice.findMany({
            where: { branchId: session.user.branchId },
            orderBy: { createdAt: 'desc' }
        })

        // CSV Header
        const headers = [
            'Invoice No.', 
            'Date', 
            'Payment Method', 
            'Sub Total', 
            'Tax (5%)', 
            'Discount', 
            'Final Amount', 
            'Status'
        ]

        // Map invoices to CSV rows
        const rows = invoices.map(invoice => [
            `"${invoice.invoiceNumber}"`,
            `"${new Date(invoice.createdAt).toLocaleString()}"`,
            `"${invoice.paymentMethod}"`,
            invoice.subTotal,
            invoice.taxAmount,
            invoice.discountAmount,
            invoice.finalAmount,
            `"${invoice.paymentStatus}"`
        ])

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        // Add UTF-8 BOM to ensure Excel reads unicode characters correctly (if any)
        const BOM = '\uFEFF'
        const finalCsv = BOM + csvContent

        return new NextResponse(finalCsv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="invoices_export.csv"',
            }
        })
    } catch (error) {
        console.error("Error generating CSV:", error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
