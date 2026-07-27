import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const branch = await prisma.branch.findFirst({ where: { name: 'test' } })
        if (!branch) return NextResponse.json({ error: "no branch" })

        const data = await prisma.menuOnBranch.findMany({
            where: { branchId: branch.id },
            include: {
                menu: {
                    include: {
                        addonCategories: {
                            where: { branchId: branch.id },
                            include: { addons: true }
                        }
                    }
                }
            }
        })
        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message })
    }
}
