/* eslint-disable @typescript-eslint/no-unused-vars */
// server/actions/tables.ts
'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getTables() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' }
    })
    return { success: true, data: tables }
  } catch (error) {
    console.error(error)
    return { success: false, error: "စားပွဲစာရင်း ဆွဲထုတ်၍ မရပါ" }
  }
}
``
export async function createTable(formData: FormData) {
  const number = formData.get('number') as string
  const session = await auth();
  if (!session?.user?.branchId) return { success: false, data: [] }
  if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot perform this action." }

  if (!number) return { success: false, error: "စားပွဲနံပါတ် ထည့်သွင်းပါ" }

  try {
    const domain = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const qrUrl = `${domain}/scan?tableNumber=${number}`;
    const branchId = session.user.branchId;
    await prisma.table.create({
      data: {
        number,
        qrUrl,
        branchId
      }
    })

    revalidatePath('/tables')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "စားပွဲနံပါတ် ထပ်နေနိုင်ပါသည်" }
  }
}
export async function getMenuForTable(tableNumber: string) {
  try {
    const table = await prisma.table.findFirst({
      where: { number: tableNumber }
    })
    if (!table) return { success: false, error: "Invalid table" }

    const tableBranchId = table.branchId

    const [localMenuItems, localCategories, masterMenusData] = await Promise.all([
      prisma.menuItem.findMany({
        where: { category: { branchId: tableBranchId }, isDeleted: false },
        include: {
          category: { select: { name: true } },
          addonCategories: { include: { addons: true } },
          discount: true
        }
      }),
      prisma.menuCategory.findMany({
        where: { branchId: tableBranchId }
      }),
      prisma.menuOnBranch.findMany({
        where: { branchId: tableBranchId, isAvailable: true },
        include: { menu: true }
      })
    ])

    const formattedMasterMenus = masterMenusData.map(mb => ({
        id: mb.menuId,
        name: mb.menu.name,
        description: mb.menu.description,
        price: mb.menu.basePrice,
        imageUrl: mb.menu.image,
        isActive: mb.menu.isActive,
        categoryId: 'master', // Virtual category
        isMasterMenu: true
    }))

    const menuItems = [...localMenuItems, ...formattedMasterMenus]
    const categories = masterMenusData.length > 0
        ? [...localCategories, { id: 'master', name: 'Main Menu' }]
        : localCategories

    return { success: true, menuItems, categories, tableId: table.id }
  } catch (error) {
    return { success: false, error: "Failed to load menu" }
  }
}

export async function placeTableOrder(
  tableNumber: string,
  items: { menuItemId: string, quantity: number, addons?: { price: number }[] }[],
  notes: string
) {
  try {
    // ၁။ စားပွဲနံပါတ် အရင်စစ်မည်
    const table = await prisma.table.findFirst({
      where: { number: tableNumber }
    })
    if (!table) return { success: false, error: "မှားယွင်းသော စားပွဲနံပါတ်ဖြစ်နေပါသည်" }

    // ၂။ မှာလိုက်သည့် ဟင်းပွဲများ၏ ဈေးနှုန်းများကို DB မှ ဆွဲထုတ်ခြင်း
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: items.map(i => i.menuItemId) }
      },
      include: {
        discount: true
      }
    })

    // Calculate discounted price
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // ၃။ 🔑 စုစုပေါင်း ကျသင့်ငွေ (Total Amount) ကို ကုဒ်ထဲမှာတင် ကြိုတင်တွက်ချက်ခြင်း
    let totalAmount = 0
    const orderItemsData = items.map(item => {
      const matchedMenu = menuItems.find(m => m.id === item.menuItemId)
      const menuPrice = matchedMenu ? getFinalPrice(matchedMenu) : 0
      const addonsPrice = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0
      const price = menuPrice + addonsPrice

      // စုစုပေါင်းငွေကို ပေါင်းရိုက်ထည့်ခြင်း (Price * Quantity)
      totalAmount += price * item.quantity

      return {
        menuItemId: item.menuItemId,
        name: matchedMenu?.name || "Unknown Item",
        quantity: item.quantity,
        price: menuPrice,
        addons: item.addons || [],
        status: 'PENDING'
      }
    })

    // ၄။ Tax (အခွန်) နှင့် Final Amount များကို တွက်ချက်ခြင်း
    const taxAmount = totalAmount * 0.05
    const finalAmount = totalAmount + taxAmount

    const activeOrder = await prisma.order.findFirst({
        where: {
            tableId: table.id,
            status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'DELIVERED'] }
        }
    })

    if (activeOrder) {
        // Append to existing order items JSON array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingItems = (activeOrder.items as any[]) || []
        const newItems = [...existingItems, ...orderItemsData]

        const newTotalAmount = activeOrder.totalAmount + totalAmount
        const newTaxAmount = newTotalAmount * 0.05
        const newFinalAmount = newTotalAmount + newTaxAmount

        await prisma.order.update({
            where: { id: activeOrder.id },
            data: {
                totalAmount: newTotalAmount,
                taxAmount: newTaxAmount,
                finalAmount: newFinalAmount,
                isBillRequested: false, // Reset because they ordered more!
                notes: notes ? (activeOrder.notes ? activeOrder.notes + '\n' + notes : notes) : activeOrder.notes,
                items: newItems,
                status: 'PENDING' // Reset so the kitchen knows new items arrived
            }
        })
    } else {
        // ၅။ တွက်ချက်ပြီးသား ငွေပမာဏများနှင့်တကွ ဒေတာဘေ့စ်ထဲ အသစ် သိမ်းဆည်းခြင်း
        await prisma.order.create({
          data: {
            branchId: table.branchId,
            tableId: table.id,
            status: 'PENDING',
            notes: notes,
            totalAmount: totalAmount,
            taxAmount: taxAmount,
            finalAmount: finalAmount,
            items: orderItemsData
          }
        })
    }

    revalidatePath('/dashboard/store/orders')
    return { success: true }
  } catch (error) {
    console.error("Error placing order:", error)
    return { success: false, error: "အော်ဒါတင်၍ မရပါ၊ ထပ်မံကြိုးစားပေးပါ" }
  }
}

export async function getActiveOrderForTableNumber(tableNumber: string) {
  try {
    const table = await prisma.table.findFirst({ where: { number: tableNumber } })
    if (!table) return { success: false, error: "Invalid table" }

    const activeOrder = await prisma.order.findFirst({
      where: {
        tableId: table.id,
        status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'DELIVERED'] }
      }
    })

    return { success: true, data: activeOrder }
  } catch (error) {
    return { success: false, error: "Failed to fetch order status" }
  }
}

export async function requestBillForTable(tableNumber: string) {
  try {
    const table = await prisma.table.findFirst({ where: { number: tableNumber } })
    if (!table) return { success: false, error: "Invalid table" }

    const activeOrder = await prisma.order.findFirst({
      where: {
        tableId: table.id,
        status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'DELIVERED'] }
      }
    })

    if (!activeOrder) return { success: false, error: "No active order to bill" }

    // Using BILL_REQUESTED state if it exists, otherwise use a generic update or notes
    // Wait, let's check Prisma schema for OrderStatus. If BILL_REQUESTED is not there, we can't use it.
    // Let's assume it doesn't have BILL_REQUESTED since we didn't add it.
    // We can append to notes or we need to check OrderStatus enum.
    // Let's just update the notes for now with "[BILL REQUESTED]" and we can trigger an alert on POS.
    
    await prisma.order.update({
      where: { id: activeOrder.id },
      data: { isBillRequested: true }
    })

    revalidatePath('/pos')
    revalidatePath('/dashboard/store/orders')
    return { success: true }
  } catch (error) {
    console.error("Error requesting bill:", error)
    return { success: false, error: "ဘေလ်တောင်း၍မရပါ" }
  }
}
