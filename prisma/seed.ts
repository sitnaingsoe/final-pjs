// prisma/seed.ts

// ⚠️ အရေးကြီးချက်: မိတ်ဆွေထုတ်ထားတဲ့ Custom Generated Path ထဲက Client ကို တိုက်ရိုက်ယူထားပါတယ်
import { OrderStatus } from './generated/enums'
import { prisma } from "@/lib/db";

async function main() {
    console.log('🚀 Restaurant Backoffice ဒေတာများ စတင်ထည့်သွင်းနေပါပြီ...')


    console.log('🧹 ဒေတာဟောင်းများကို အကုန်ဖျက်သိမ်းနေသည်...')
    await prisma.orderItemAddon.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.menuItemAddonCategory.deleteMany()
    await prisma.addon.deleteMany()
    await prisma.addonCategory.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.menuCategory.deleteMany()
    await prisma.discount.deleteMany()
    await prisma.setting.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()

    // -------------------------------------------------------------
    // အဆင့် (၂) စမ်းသပ်ရန် အက်ဒမင်အကောင့် (User & Post) ဆောက်ခြင်း
    // -------------------------------------------------------------
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@digitaldiner.com",
            name: "ကိုမောင်မောင်",
            password: "hashed_secure_password_here", // အပြင်တွင် bcrypt ဖြင့် hash လုပ်ရန်
            posts: {
                create: [
                    { title: "စားသောက်ဆိုင် Backoffice စနစ် စတင်ဖွင့်လှစ်ခြင်း", published: true }
                ]
            }
        }
    })
    console.log(`✅ အက်ဒမင်အကောင့် ဖန်တီးပြီးပါပြီ: ${adminUser.email}`)

    // -------------------------------------------------------------
    // အဆင့် (၃) ဆိုင်၏ Setting တည်ဆောက်ခြင်း
    // -------------------------------------------------------------
    const shopSetting = await prisma.setting.create({
        data: {
            restaurantName: "မြန်မာ့ရသာ စားသောက်ဆိုင်",
            currency: "MMK",
            taxRate: 5.0, // ကုန်သွယ်လုပ်ငန်းခွန် ၅ ရာခိုင်နှုန်း
            isAcceptingOrders: true,
        },
    })
    console.log(`✅ ဆိုင် Setting ထည့်သွင်းပြီး: ${shopSetting.restaurantName}`)

    // -------------------------------------------------------------
    // အဆင့် (၄) ပရိုမိုးရှင်း လျှော့စျေး (Discounts) တည်ဆောက်ခြင်း
    // -------------------------------------------------------------
    const openingPromo = await prisma.discount.create({
        data: {
            name: "မိတ်ဆက်ပရိုမိုးရှင်း ၁၀%",
            type: "PERCENTAGE",
            value: 10,
            isActive: true,
        },
    })


    const noodleCategory = await prisma.menuCategory.create({
        data: { name: "ခေါက်ဆွဲနှင့် အကြော်အလှော်", description: "ရိုးရာမုန့်ဟင်းခါးနှင့် ဆီချက်များ" },
    })

    const toppingCategory = await prisma.addonCategory.create({
        data: {
            name: "အပိုထပ်ဆောင်း ညှပ်ရန်",
            minSelect: 0,
            maxSelect: 3,
            addons: {
                create: [
                    { name: "ကြက်ဥပြုတ်", price: 500 },
                    { name: "ဘဲဥပြုတ်", price: 600 },
                    { name: "အကြော်စုံ", price: 600 },
                ],
            },
        },
        include: { addons: true }, // အောက်ခြေတွင် ID ပြန်သုံးရန် include လုပ်ရပါမည်
    })


    const mohingaItem = await prisma.menuItem.create({
        data: {
            name: "မြန်မာ့ရိုးရာ မုန့်ဟင်းခါး အထူးပွဲ",
            description: "ငါးခူစစ်စစ် အသားနွှင်ချက်ထားသော ဟင်းခါးပူပူနွေးနွေး",
            price: 2500,
            categoryId: noodleCategory.id,
            discountId: openingPromo.id, // ၁၀% လျှော့စျေးနှင့် ချိတ်ဆက်သည်
            // Many-to-Many Bridge Table (MenuItemAddonCategory) ထဲသို့ တစ်ခါတည်း ဒေတာသွင်းခြင်း
            addonCategories: {
                create: [
                    { addonCategoryId: toppingCategory.id }
                ]
            }
        },
    })
    console.log('✅ စားစရာမီနူးများနှင့် အပိုပစ္စည်းများ ချိတ်ဆက်မှု အောင်မြင်သည်။')

    // -------------------------------------------------------------
    // အဆင့် (၈) စမ်းသပ်ရန် အော်ဒါ (Mock Orders) အသစ်သွင်းခြင်း
    // -------------------------------------------------------------
    // ဖန်တီးခဲ့သော Addon ထဲမှ 'ကြက်ဥပြုတ်' ID ကို ရှာဖွေခြင်း
    const eggAddon = toppingCategory.addons.find(a => a.name === "ကြက်ဥပြုတ်")! as any

    await prisma.order.create({
        data: {
            status: OrderStatus.PENDING as any, // Backoffice တွင် Confirm လုပ်ရန် ပေါ်လာမည့် အခြေအနေ
            notes: "ဟင်းရည်များများပေးပါ၊ နံနံပင်မထည့်ပါနှင့်",
            totalAmount: 3000, // မုန့်ဟင်းခါး ၂၅၀၀ + ကြက်ဥ ၅၀၀
            taxAmount: 150,    // ၅ ရာခိုင်နှုန်း ခွန်
            finalAmount: 3150,
            items: {
                create: {
                    menuItemId: mohingaItem.id,
                    quantity: 1,
                    price: 2500, // မှာယူစဉ်က စျေးနှုန်း Snapshot
                    addons: {
                        create: [
                            { addonId: eggAddon.id }
                        ]
                    }
                }
            }
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