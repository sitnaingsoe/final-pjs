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
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
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

    const [menuItems, categories] = await Promise.all([
      prisma.menuItem.findMany({
        where: { category: { branchId: tableBranchId } },
        include: {
          category: { select: { name: true } },
          addonCategories: { include: { addonCategory: { include: { addons: true } } } }
        }
      }),
      prisma.menuCategory.findMany({
        where: { branchId: tableBranchId }
      })
    ])

    return { success: true, menuItems, categories, tableId: table.id }
  } catch (error) {
    return { success: false, error: "Failed to load menu" }
  }
}

export async function placeTableOrder(
  tableNumber: string,
  items: { menuItemId: string, quantity: number }[],
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
      }
    })

    // ၃။ 🔑 စုစုပေါင်း ကျသင့်ငွေ (Total Amount) ကို ကုဒ်ထဲမှာတင် ကြိုတင်တွက်ချက်ခြင်း
    let totalAmount = 0
    const orderItemsData = items.map(item => {
      const matchedMenu = menuItems.find(m => m.id === item.menuItemId)
      const price = matchedMenu ? matchedMenu.price : 0

      // စုစုပေါင်းငွေကို ပေါင်းရိုက်ထည့်ခြင်း (Price * Quantity)
      totalAmount += price * item.quantity

      return {
        quantity: item.quantity,
        price: price,
        menuItem: {
          connect: { id: item.menuItemId }
        }
      }
    })

    // ၄။ Tax (အခွန်) နှင့် Final Amount များကို တွက်ချက်ခြင်း
    const taxAmount = totalAmount * 0.05
    const finalAmount = totalAmount + taxAmount

    // ၅။ တွက်ချက်ပြီးသား ငွေပမာဏများနှင့်တကွ ဒေတာဘေ့စ်ထဲ သိမ်းဆည်းခြင်း
    await prisma.order.create({
      data: {
        branchId: table.branchId, // 👈 Added branchId requirement
        tableId: table.id,
        status: 'PENDING',
        notes: notes,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        finalAmount: finalAmount,
        items: {
          create: orderItemsData
        }
      }
    })

    revalidatePath('/dashboard/store/orders')
    return { success: true }
  } catch (error) {
    console.error("Error placing order:", error)
    return { success: false, error: "အော်ဒါတင်၍ မရပါ၊ ထပ်မံကြိုးစားပေးပါ" }
  }
}