// server/actions/tables.ts
'use server'

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

  if (!number) return { success: false, error: "စားပွဲနံပါတ် ထည့်သွင်းပါ" }

  try {
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const qrUrl = `${domain}/scan?tableNumber=${number}`

    await prisma.table.create({
      data: {
        number,
        qrUrl
      }
    })

    revalidatePath('/tables')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "စားပွဲနံပါတ် ထပ်နေနိုင်ပါသည်" }
  }
}



export async function placeTableOrder(
  tableNumber: string,
  items: { menuItemId: string, quantity: number }[],
  notes: string
) {
  try {
    // ၁။ စားပွဲနံပါတ် အရင်စစ်မည်
    const table = await prisma.table.findUnique({
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
    // ဥပမာ အခွန် ၅% ဟု တွက်ပြထားပါသည် (အကယ်၍ အခွန်မရှိပါက 0 ဟု ထားနိုင်ပါသည်)
    const taxAmount = totalAmount * 0.05
    const finalAmount = totalAmount + taxAmount

    // ၅။ တွက်ချက်ပြီးသား ငွေပမာဏများနှင့်တကွ ဒေတာဘေ့စ်ထဲ သိမ်းဆည်းခြင်း
    await prisma.order.create({
      data: {
        tableId: table.id,
        status: 'PENDING',
        notes: notes,
        totalAmount: totalAmount,  // 👈 တောင်းနေသော field အား ထည့်ပေးခြင်း
        taxAmount: taxAmount,      // 👈 တောင်းနေသော field အား ထည့်ပေးခြင်း
        finalAmount: finalAmount,  // 👈 တောင်းနေသော field အား ထည့်ပေးခြင်း
        items: {
          create: orderItemsData
        }
      }
    })

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error("Error placing order:", error)
    return { success: false, error: "အော်ဒါတင်၍ မရပါ၊ ထပ်မံကြိုးစားပေးပါ" }
  }
}