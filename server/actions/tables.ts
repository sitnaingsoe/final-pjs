/* eslint-disable @typescript-eslint/no-unused-vars */
// server/actions/tables.ts
'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getTables() {
  const session = await auth()
  if (!session?.user?.branchId) return { success: false, data: [] }
  try {
    const tables = await prisma.table.findMany({
      where: { branchId: session.user.branchId },
      orderBy: { number: 'asc' }
    })
    return { success: true, data: tables }
  } catch (error) {
    console.error(error)
    return { success: false, error: "စားပွဲစာရင်း ဆွဲထုတ်၍ မရပါ" }
  }
}

export async function createTable(formData: FormData) {
  const number = formData.get('number') as string
  const session = await auth();
  if (!session?.user?.branchId) return { success: false, data: [] }
  if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot perform this action." }

  if (!number) return { success: false, error: "စားပွဲနံပါတ် ထည့်သွင်းပါ" }

  try {
    const domain = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const branchId = session.user.branchId;

    const newTable = await prisma.table.create({
      data: {
        number,
        qrUrl: '',
        branchId
      }
    })

    const qrUrl = `${domain}/scan?tableId=${newTable.id}&tableNumber=${encodeURIComponent(number)}`;
    await prisma.table.update({
      where: { id: newTable.id },
      data: { qrUrl }
    })

    revalidatePath('/tables')
    revalidatePath('/dashboard/store/tables')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "စားပွဲနံပါတ် ထပ်နေနိုင်ပါသည်" }
  }
}

export async function getMenuForTable(tableNumber: string, tableId?: string | null) {
  try {
    let table = null
    if (tableId) {
      table = await prisma.table.findUnique({ where: { id: tableId } })
    }
    if (!table && tableNumber && tableNumber !== 'Unknown') {
      table = await prisma.table.findFirst({ where: { number: tableNumber } })
    }
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
        where: { branchId: tableBranchId },
        include: { menu: true }
      })
    ])

    const formattedMasterMenus = masterMenusData.map(mb => ({
        id: mb.menuId,
        name: mb.menu.name,
        description: mb.menu.description,
        price: mb.menu.basePrice,
        imageUrl: mb.menu.image,
        isActive: mb.isAvailable && mb.menu.isActive,
        categoryId: 'master',
        isMasterMenu: true
    }))

    const menuItems = [...localMenuItems, ...formattedMasterMenus]
    const categories = masterMenusData.length > 0
        ? [...localCategories, { id: 'master', name: 'Main Menu' }]
        : localCategories

    return { success: true, menuItems, categories, tableId: table.id, branchId: tableBranchId }
  } catch (error) {
    return { success: false, error: "Failed to load menu" }
  }
}

export async function placeTableOrder(
  tableNumber: string,
  items: { menuItemId: string, quantity: number, addons?: { price: number }[] }[],
  notes: string,
  tableId?: string | null
) {
  try {
    let table = null
    if (tableId) {
      table = await prisma.table.findUnique({ where: { id: tableId } })
    }
    if (!table && tableNumber) {
      table = await prisma.table.findFirst({ where: { number: tableNumber } })
    }
    if (!table) return { success: false, error: "မှားယွင်းသော စားပွဲနံပါတ်ဖြစ်နေပါသည်" }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: items.map(i => i.menuItemId) }
      },
      include: {
        discount: true
      }
    })

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

    let totalAmount = 0
    const orderItemsData = items.map(item => {
      const matchedMenu = menuItems.find(m => m.id === item.menuItemId)
      const menuPrice = matchedMenu ? getFinalPrice(matchedMenu) : 0
      const addonsPrice = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0
      const price = menuPrice + addonsPrice

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

    const taxAmount = totalAmount * 0.05
    const finalAmount = totalAmount + taxAmount

    const activeOrder = await prisma.order.findFirst({
        where: {
            tableId: table.id,
            status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'DELIVERED'] }
        }
    })

    if (activeOrder) {
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
                isBillRequested: false,
                notes: notes ? (activeOrder.notes ? activeOrder.notes + '\n' + notes : notes) : activeOrder.notes,
                items: newItems,
                status: 'PENDING'
            }
        })
    } else {
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

export async function getActiveOrderForTableNumber(tableNumber: string, tableId?: string | null) {
  try {
    let table = null
    if (tableId) {
      table = await prisma.table.findUnique({ where: { id: tableId } })
    }
    if (!table && tableNumber) {
      table = await prisma.table.findFirst({ where: { number: tableNumber } })
    }
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

export async function requestBillForTable(tableNumber: string, tableId?: string | null) {
  try {
    let table = null
    if (tableId) {
      table = await prisma.table.findUnique({ where: { id: tableId } })
    }
    if (!table && tableNumber) {
      table = await prisma.table.findFirst({ where: { number: tableNumber } })
    }
    if (!table) return { success: false, error: "Invalid table" }

    const activeOrder = await prisma.order.findFirst({
      where: {
        tableId: table.id,
        status: { in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'DELIVERED'] }
      }
    })

    if (!activeOrder) return { success: false, error: "No active order to bill" }

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

export async function cancelTableOrder(orderId: string) {
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, items: true }
      })

      if (!order) {
        throw new Error("Order not found")
      }

      if (['PAID', 'CANCELLED'].includes(order.status)) {
        throw new Error("ဤအော်ဒါအား ဖျက်၍မရတော့ပါ")
      }

      const items = (order.items as any[]) || []
      const hasPendingItems = items.some(item => (item.status || 'PENDING') === 'PENDING')

      if (!hasPendingItems) {
        throw new Error("ဖျက်ရန် စောင့်ဆိုင်းနေသော ဟင်းပွဲမရှိပါ (သို့မဟုတ်) မီးဖိုချောင်မှ စတင်ပြင်ဆင်နေပါပြီ။")
      }

      // 1. Mark pending items as CANCELLED
      const updatedItems = items.map(item => 
        (item.status || 'PENDING') === 'PENDING' 
          ? { ...item, status: 'CANCELLED' } 
          : item
      )

      // 2. Recalculate totals for remaining active items
      let newTotalAmount = 0
      updatedItems.forEach(item => {
        if (item.status !== 'CANCELLED') {
          const addonsPrice = item.addons?.reduce((sum: number, a: any) => sum + (a.price || 0), 0) || 0
          const price = item.price + addonsPrice
          newTotalAmount += price * item.quantity
        }
      })

      const newTaxAmount = newTotalAmount * 0.05
      const newFinalAmount = newTotalAmount + newTaxAmount

      // 3. Resolve new top-level status
      let newStatus = order.status
      const activeItems = updatedItems.filter(i => i.status !== 'CANCELLED')
      if (activeItems.length === 0) {
        newStatus = 'CANCELLED'
      } else {
        const statuses = activeItems.map(i => i.status || 'PENDING')
        if (statuses.includes('PENDING')) {
          newStatus = 'PENDING'
        } else if (statuses.includes('CONFIRMED')) {
          newStatus = 'CONFIRMED'
        } else if (statuses.includes('COOKING')) {
          newStatus = 'COOKING'
        } else if (statuses.includes('READY')) {
          newStatus = 'READY'
        } else if (statuses.every(s => s === 'DELIVERED')) {
          newStatus = 'DELIVERED'
        }
      }

      return await tx.order.update({
        where: { id: orderId },
        data: {
          items: updatedItems,
          totalAmount: newTotalAmount,
          taxAmount: newTaxAmount,
          finalAmount: newFinalAmount,
          status: newStatus as any
        }
      })
    })

    revalidatePath('/pos')
    revalidatePath('/dashboard/store/orders')
    return { success: true }
  } catch (error: any) {
    console.error("Error cancelling order:", error)
    return { success: false, error: error.message || "အော်ဒါဖျက်၍ မရပါ" }
  }
}

export async function cancelTableOrderItem(orderId: string, itemIndex: number) {
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, items: true }
      })

      if (!order) {
        throw new Error("Order not found")
      }

      if (['PAID', 'CANCELLED'].includes(order.status)) {
        throw new Error("ဤအော်ဒါအား ပြင်ဆင်၍မရတော့ပါ")
      }

      const items = (order.items as any[]) || []
      const itemToCancel = items[itemIndex]

      if (!itemToCancel) {
        throw new Error("ဟင်းပွဲ ရှာမတွေ့ပါ")
      }

      if ((itemToCancel.status || 'PENDING') !== 'PENDING') {
        throw new Error("မီးဖိုချောင်မှ စတင်ပြင်ဆင်နေပြီဖြစ်၍ ဖျက်၍မရတော့ပါ။")
      }

      // 1. Mark this specific item as CANCELLED
      const updatedItems = items.map((item, idx) => 
        idx === itemIndex 
          ? { ...item, status: 'CANCELLED' } 
          : item
      )

      // 2. Recalculate totals for remaining active items
      let newTotalAmount = 0
      updatedItems.forEach(item => {
        if (item.status !== 'CANCELLED') {
          const addonsPrice = item.addons?.reduce((sum: number, a: any) => sum + (a.price || 0), 0) || 0
          const price = item.price + addonsPrice
          newTotalAmount += price * item.quantity
        }
      })

      const newTaxAmount = newTotalAmount * 0.05
      const newFinalAmount = newTotalAmount + newTaxAmount

      // 3. Resolve new top-level status
      let newStatus = order.status
      const activeItems = updatedItems.filter(i => i.status !== 'CANCELLED')
      if (activeItems.length === 0) {
        newStatus = 'CANCELLED'
      } else {
        const statuses = activeItems.map(i => i.status || 'PENDING')
        if (statuses.includes('PENDING')) {
          newStatus = 'PENDING'
        } else if (statuses.includes('CONFIRMED')) {
          newStatus = 'CONFIRMED'
        } else if (statuses.includes('COOKING')) {
          newStatus = 'COOKING'
        } else if (statuses.includes('READY')) {
          newStatus = 'READY'
        } else if (statuses.every(s => s === 'DELIVERED')) {
          newStatus = 'DELIVERED'
        }
      }

      return await tx.order.update({
        where: { id: orderId },
        data: {
          items: updatedItems,
          totalAmount: newTotalAmount,
          taxAmount: newTaxAmount,
          finalAmount: newFinalAmount,
          status: newStatus as any
        }
      })
    })

    revalidatePath('/pos')
    revalidatePath('/dashboard/store/orders')
    return { success: true, data: updatedOrder }
  } catch (error: any) {
    console.error("Error cancelling order item:", error)
    return { success: false, error: error.message || "ဟင်းပွဲဖျက်၍ မရပါ" }
  }
}
