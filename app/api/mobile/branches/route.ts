import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Active branches စာရင်း (Public endpoint - auth မလို)
export async function GET() {
    try {
        const branches = await prisma.branch.findMany({
            where: { isAcceptingOrders: true },
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                restaurantName: true,
                currency: true,
                latitude: true,
                longitude: true,
                companyId: true,
                company: {
                    select: { name: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        const formattedBranches = branches.map(b => ({
            id: b.id,
            name: b.name,
            address: b.address,
            phone: b.phone,
            restaurantName: b.restaurantName,
            currency: b.currency,
            latitude: b.latitude,
            longitude: b.longitude,
            companyId: b.companyId,
            companyName: b.company?.name || null,
        }))

        return NextResponse.json({
            success: true,
            data: formattedBranches,
        })
    } catch (error) {
        console.error("Branches API Error:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
