/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db'
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { branchId, items, notes } = body;

    if (!branchId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "branchId and items are required" },
        { status: 400 }
      );
    }

    // 1. Fetch branch to ensure it exists
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Invalid branchId" },
        { status: 400 }
      );
    }

    // 2. Fetch menu items with their discounts to calculate prices securely on server
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: items.map(i => i.menuItemId) }
      },
      include: {
        discount: true
      }
    });

    // Helper to calculate discounted price
    const getFinalPrice = (item: any) => {
        let finalPrice = item.price;
        if (item.discount && item.discount.isActive) {
            if (item.discount.type === 'PERCENTAGE') {
                finalPrice = finalPrice - (finalPrice * (item.discount.value / 100));
            } else {
                finalPrice = Math.max(0, finalPrice - item.discount.value);
            }
        }
        return finalPrice;
    }

    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      const matchedMenu = menuItems.find(m => m.id === item.menuItemId);
      const menuPrice = matchedMenu ? getFinalPrice(matchedMenu) : 0;
      
      // Calculate addons price
      const addonsPrice = item.addons?.reduce((sum: number, a: any) => sum + (a.price || 0), 0) || 0;
      
      const itemTotal = (menuPrice + addonsPrice) * item.quantity;
      totalAmount += itemTotal;

      return {
        menuItemId: item.menuItemId,
        name: matchedMenu?.name || "Unknown Item",
        quantity: item.quantity,
        price: menuPrice,
        addons: item.addons || [],
        status: 'PENDING'
      };
    });

    // 3. Calculate Taxes
    const taxAmount = totalAmount * (branch.taxRate / 100);
    const finalAmount = totalAmount + taxAmount;

    // 4. Create Order without tableId (McDonald's Kiosk / Mobile App style)
    const newOrder = await prisma.order.create({
      data: {
        branchId: branchId,
        tableId: null, // No table linked
        status: 'PENDING',
        notes: notes || null,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        finalAmount: finalAmount,
        items: orderItemsData
      }
    });

    // 5. Revalidate Next.js cache so POS screens update instantly
    revalidatePath('/dashboard/store/orders');
    revalidatePath('/pos');

    // 6. Return the order details, specifically orderId and orderNumber
    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      finalAmount: newOrder.finalAmount
    });

  } catch (error: any) {
    console.error("Error creating mobile order:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
