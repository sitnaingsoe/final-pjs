/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");

    // If no branchId is provided, just return a bad request or an empty list. 
    // For now, let's return all active categories and items if no branchId is provided, 
    // or filter by branchId if provided.

    let whereCategory = { isActive: true };
    if (branchId) {
      whereCategory = { ...whereCategory, branchId } as any;
    }

    const categories = await prisma.menuCategory.findMany({
      where: whereCategory,
      include: {
        menuItems: {
          where: {
            isActive: true,
            isDeleted: false,
          },
          include: {
            discount: true,
          }
        },
        branch: true,
      },
      orderBy: {
        createdAt: 'asc',
      }
    });

    // Flattening the items out if needed, but keeping the grouped structure is also fine.
    // We'll return both a flat list of items and a list of categories for flexibility in the mobile app.

    const flatMenuItems = categories.flatMap(c =>
      c.menuItems.map(item => ({
        ...item,
        branchName: c.branch?.name
      }))
    );

    const activeDiscounts = await prisma.discount.findMany({
      where: {
        isActive: true,
        ...(branchId ? { branchId } : {}),
      },
    });

    const categoriesResponse = categories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      branchId: c.branchId,
      branchName: c.branch?.name,
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesResponse,
      menuItems: flatMenuItems,
      discounts: activeDiscounts,
    });
  } catch (error: any) {
    console.error("Error fetching mobile menus:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
