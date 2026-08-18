import { NextResponse } from "next/server";
import { cancelTableOrderItem } from "@/server/actions/tables";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const branch = await prisma.branch.findFirst();
    if (!branch) {
      return NextResponse.json({ error: "No branch found" }, { status: 400 });
    }

    // 1. Create a dummy order
    const orderItems = [
      {
        menuItemId: "item-a",
        name: "Item A (Pending)",
        quantity: 1,
        price: 1000,
        addons: [],
        status: "PENDING"
      },
      {
        menuItemId: "item-b",
        name: "Item B (Pending)",
        quantity: 1,
        price: 1500,
        addons: [],
        status: "PENDING"
      },
      {
        menuItemId: "item-c",
        name: "Item C (Cooking)",
        quantity: 1,
        price: 2000,
        addons: [],
        status: "COOKING"
      }
    ];

    // Total: 4500. Tax: 225. Final: 4725. Status: PENDING
    const order = await prisma.order.create({
      data: {
        branchId: branch.id,
        status: "PENDING",
        totalAmount: 4500,
        taxAmount: 225,
        finalAmount: 4725,
        items: orderItems
      }
    });

    // 2. Cancel Item B (index 1)
    const cancelItemBRes = await cancelTableOrderItem(order.id, 1);
    
    // Fetch updated order
    let updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    if (!updatedOrder) throw new Error("Order not found after cancelling B");

    let items = (updatedOrder.items as any[]) || [];
    const isBMarkedCancelled = items[1] && items[1].status === "CANCELLED";
    const isAMaintainedPending = items[0] && items[0].status === "PENDING";
    const isCMaintainedCooking = items[2] && items[2].status === "COOKING";
    
    // Remaining active: Item A (1000) + Item C (2000) = 3000. Tax = 150. Final = 3150.
    const isTotalAfterBRecalculated = updatedOrder.totalAmount === 3000 && updatedOrder.finalAmount === 3150;
    const isStatusAfterBStillPending = updatedOrder.status === "PENDING"; // Since A is still pending

    // 3. Cancel Item A (index 0)
    const cancelItemARes = await cancelTableOrderItem(order.id, 0);

    // Fetch updated order again
    updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    if (!updatedOrder) throw new Error("Order not found after cancelling A");

    items = (updatedOrder.items as any[]) || [];
    const isAMarkedCancelled = items[0] && items[0].status === "CANCELLED";
    
    // Remaining active: Item C (2000) = 2000. Tax = 100. Final = 2100.
    const isTotalAfterARecalculated = updatedOrder.totalAmount === 2000 && updatedOrder.finalAmount === 2100;
    
    // Top-level status should resolve to COOKING because only cooking item is active
    const isStatusAfterAResolvedToCooking = updatedOrder.status === "COOKING";

    // Clean up
    await prisma.order.delete({
      where: { id: order.id }
    });

    return NextResponse.json({
      success: 
        cancelItemBRes.success && isBMarkedCancelled && isAMaintainedPending && isCMaintainedCooking && isTotalAfterBRecalculated && isStatusAfterBStillPending &&
        cancelItemARes.success && isAMarkedCancelled && isTotalAfterARecalculated && isStatusAfterAResolvedToCooking,
      verification: {
        step1_CancelBSuccess: cancelItemBRes.success,
        step1_isBMarkedCancelled: isBMarkedCancelled,
        step1_isAMaintainedPending: isAMaintainedPending,
        step1_isCMaintainedCooking: isCMaintainedCooking,
        step1_isTotalRecalculated: isTotalAfterBRecalculated,
        step1_isStatusStillPending: isStatusAfterBStillPending,
        step2_CancelASuccess: cancelItemARes.success,
        step2_isAMarkedCancelled: isAMarkedCancelled,
        step2_isTotalRecalculated: isTotalAfterARecalculated,
        step2_isStatusResolvedToCooking: isStatusAfterAResolvedToCooking
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
