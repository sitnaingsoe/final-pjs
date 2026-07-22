// prisma/seed.ts

import { OrderStatus } from './generated/enums'
import { prisma } from "@/lib/db";

async function main() {
    console.log('🚀 Restaurant Backoffice ဒေတာများ စတင်ထည့်သွင်းနေပါပြီ...')

    console.log('🧹 ဒေတာဟောင်းများကို အကုန်ဖျက်သိမ်းနေသည်...')
    await prisma.order.deleteMany()
    await prisma.addon.deleteMany()
    await prisma.addonCategory.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.menuCategory.deleteMany()
    await prisma.discount.deleteMany()
    await prisma.user.deleteMany()
    await prisma.branch.deleteMany()
    await prisma.company.deleteMany()

    // -------------------------------------------------------------
    // အဆင့် (၁) Company & Branch ဆောက်ခြင်း
    // -------------------------------------------------------------
    const company = await prisma.company.create({
        data: { name: "BiteCraft Food Group" }
    })

    const branch = await prisma.branch.create({
        data: {
            name: "လှည်းတန်းဆိုင်ခွဲ",
            companyId: company.id,
            restaurantName: "မြန်မာ့ရသာ စားသောက်ဆိုင်",
            currency: "MMK",
            taxRate: 5.0,
            isAcceptingOrders: true
        }
    })
    console.log(`✅ ဆိုင် Branch & Settings ထည့်သွင်းပြီး: ${branch.restaurantName}`)

    // -------------------------------------------------------------
    // အဆင့် (၂) စမ်းသပ်ရန် အက်ဒမင်အကောင့် (User) ဆောက်ခြင်း
    // -------------------------------------------------------------
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@digitaldiner.com",
            name: "ကိုမောင်မောင်",
            password: "hashed_secure_password_here", // bcrypt hash ideally
            branchId: branch.id,
            role: "BRANCH_ADMIN"
        }
    })
    console.log(`✅ အက်ဒမင်အကောင့် ဖန်တီးပြီးပါပြီ: ${adminUser.email}`)

    // -------------------------------------------------------------
    // အဆင့် (၃) ပရိုမိုးရှင်း လျှော့စျေး (Discounts) တည်ဆောက်ခြင်း
    // -------------------------------------------------------------
    const openingPromo = await prisma.discount.create({
        data: {
            name: "မိတ်ဆက်ပရိုမိုးရှင်း ၁၀%",
            type: "PERCENTAGE",
            value: 10,
            isActive: true,
            branchId: branch.id
        },
    })

    // -------------------------------------------------------------
    // အဆင့် (၄) Menu Categories & Addon Categories ဆောက်ခြင်း
    // -------------------------------------------------------------
    const noodleCategory = await prisma.menuCategory.create({
        data: { 
            name: "ခေါက်ဆွဲနှင့် အကြော်အလှော်", 
            description: "ရိုးရာမုန့်ဟင်းခါးနှင့် ဆီချက်များ",
            branchId: branch.id
        },
    })

    const toppingCategory = await prisma.addonCategory.create({
        data: {
            name: "အပိုထပ်ဆောင်း ညှပ်ရန်",
            minSelect: 0,
            maxSelect: 3,
            branchId: branch.id,
            addons: {
                create: [
                    { name: "ကြက်ဥပြုတ်", price: 500, branchId: branch.id },
                    { name: "ဘဲဥပြုတ်", price: 600, branchId: branch.id },
                    { name: "အကြော်စုံ", price: 600, branchId: branch.id },
                ],
            },
        },
        include: { addons: true },
    })

    // -------------------------------------------------------------
    // အဆင့် (၅) Menu Item (implicit many-to-many addon categories)
    // -------------------------------------------------------------
    const mohingaItem = await prisma.menuItem.create({
        data: {
            name: "မြန်မာ့ရိုးရာ မုန့်ဟင်းခါး အထူးပွဲ",
            description: "ငါးခူစစ်စစ် အသားနွှင်ချက်ထားသော ဟင်းခါးပူပူနွေးနွေး",
            price: 2500,
            categoryId: noodleCategory.id,
            discountId: openingPromo.id,
            addonCategories: {
                connect: [{ id: toppingCategory.id }]
            }
        },
    })
    console.log('✅ စားစရာမီနူးများနှင့် အပိုပစ္စည်းများ ချိတ်ဆက်မှု အောင်မြင်သည်။')

    // -------------------------------------------------------------
    // အဆင့် (၆) စမ်းသပ်ရန် အော်ဒါ (Mock Orders) အသစ်သွင်းခြင်း (JSON format)
    // -------------------------------------------------------------
    const eggAddon = toppingCategory.addons.find(a => a.name === "ကြက်ဥပြုတ်")!

    await prisma.order.create({
        data: {
            status: OrderStatus.PENDING,
            notes: "ဟင်းရည်များများပေးပါ၊ နံနံပင်မထည့်ပါနှင့်",
            totalAmount: 3000,
            taxAmount: 150,
            finalAmount: 3150,
            branchId: branch.id,
            items: [
                {
                    menuItemId: mohingaItem.id,
                    name: mohingaItem.name,
                    quantity: 1,
                    price: 2500,
                    addons: [
                        { addonId: eggAddon.id, name: eggAddon.name, price: eggAddon.price }
                    ]
                }
            ]
        }
    })

    console.log('✅ စမ်းသပ်ရန် အော်ဒါ (၁) ခု ထည့်သွင်းပြီးပါပြီ။')
    console.log('🌱 Seed စနစ် အောင်မြင်စွာ ပြီးဆုံးသွားပါပြီ။')
}

main()
    .catch((e) => {
        console.error('❌ Database Seeding လုပ်ဆောင်စဉ် အမှားအယွင်းရှိခဲ့သည် - ', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })