// server/actions/menu.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getMenuItems() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, data: [] }

    try {
        const data = await prisma.menuItem.findMany({
            where: { 
                category: { branchId: session.user.branchId },
                isDeleted: false
            },
            include: {
                category: { select: { name: true } },
                addonCategories: { include: { addons: true } },
                discount: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data }
    } catch (error) {
        return { success: false, data: [] }
    }
}

// ၁.၁။ သက်ဆိုင်ရာဆိုင်ခွဲအတွက် ချထားပေးသော Master Menus များကို ဆွဲထုတ်ခြင်း
export async function getBranchMasterMenus() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, data: [] }

    try {
        const data = await prisma.menuOnBranch.findMany({
            where: { branchId: session.user.branchId },
            include: {
                menu: {
                    include: {
                        addonCategories: {
                            where: { branchId: session.user.branchId },
                            include: { addons: true }
                        }
                    }
                }
            }
        })
        return { success: true, data }
    } catch (error) {
        console.error("GET BRANCH MASTER MENUS ERROR:", error)
        return { success: false, data: [] }
    }
}

// ၁.၂။ Master Menu ၏ ရရှိနိုင်မှု (Available/Unavailable) ကို ဆိုင်ခွဲမှ ပြောင်းလဲခြင်း
export async function toggleMasterMenuAvailability(menuId: string, isAvailable: boolean) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }
    
    if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot toggle menus." }

    try {
        await prisma.menuOnBranch.update({
            where: {
                menuId_branchId: {
                    menuId: menuId,
                    branchId: session.user.branchId
                }
            },
            data: { isAvailable }
        })
        revalidatePath('/dashboard/store/menu')
        revalidatePath('/pos')
        revalidatePath('/scan')
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle master menu:", error)
        return { success: false, error: "Failed to update availability" }
    }
}

// ၁.၃။ ဆိုင်ခွဲကိုယ်ပိုင် Local Menu ၏ ရရှိနိုင်မှု (In-Stock / Out-of-Stock) ကို ပြောင်းလဲခြင်း
export async function toggleLocalMenuItemAvailability(itemId: string, isActive: boolean) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }
    if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot toggle menus." }

    try {
        await prisma.menuItem.update({
            where: { id: itemId },
            data: { isActive }
        })
        revalidatePath('/dashboard/store/menu')
        revalidatePath('/pos')
        revalidatePath('/scan')
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle local menu item:", error)
        return { success: false, error: "Failed to update availability" }
    }
}

// ၂။ မီနူးအသစ်ဆောက်ခြင်း (Addon Categories ချိတ်ဆက်မှုပါဝင်သည်)
export async function createMenuItem(formData: FormData, selectedAddonCatIds: string[]) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }
    if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot create menus." }

    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File | null
    const discountId = formData.get('discountId') as string | null

    if (!name || isNaN(price) || !categoryId) {
        return { success: false, error: "လိုအပ်သော အချက်အလက်များ အားလုံး ဖြည့်စွက်ပါ" }
    }

    try {
        // Verify category belongs to branch
        const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } })
        if (!category || category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        // Upload image to DO Spaces if provided
        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            const { uploadFileToSpaces } = await import('@/lib/s3')
            imageUrl = await uploadFileToSpaces(imageFile, 'menu-items')
        }

        await prisma.menuItem.create({
            data: {
                name,
                price,
                categoryId,
                description,
                imageUrl, // Store uploaded image URL
                discountId: discountId || null,
                addonCategories: {
                    connect: selectedAddonCatIds.map(id => ({ id }))
                }
            }
        })
        revalidatePath('/dashboard/store/menu')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "မီနူးအသစ်ထည့်သွင်းခြင်း မအောင်မြင်ပါ" }
    }
}

// ၃။ မီနူး ပြင်ဆင်ခြင်း (Update)
export async function updateMenuItem(id: string, formData: FormData, selectedAddonCatIds: string[]) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }
    if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot update menus." }

    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File | null
    const discountId = formData.get('discountId') as string | null

    if (!name || isNaN(price) || !categoryId) {
        return { success: false, error: "လိုအပ်သော အချက်အလက်များ အားလုံး ဖြည့်စွက်ပါ" }
    }

    try {
        // Verify category belongs to branch
        const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } })
        if (!category || category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        // Verify menuItem belongs to branch
        const menuItem = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } })
        if (!menuItem || menuItem.category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        let imageUrl = menuItem.imageUrl
        if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
            const { uploadFileToSpaces } = await import('@/lib/s3')
            imageUrl = await uploadFileToSpaces(imageFile, 'menu-items')
        }

        // အချက်အလက်အသစ်များနှင့် Addon အသစ်များကို အစားထိုးပြင်ဆင်သည်
        await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                price,
                categoryId,
                description,
                imageUrl, // Update image URL if new one is uploaded
                discountId: discountId || null,
                addonCategories: {
                    set: selectedAddonCatIds.map(id => ({ id }))
                }
            }
        })
        revalidatePath('/dashboard/store/menu')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြင်ဆင်ခြင်း မအောင်မြင်ပါ" }
    }
}

// ၄။ မီနူး ဖျက်ဆီးခြင်း
export async function deleteMenuItem(id: string) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }
    if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied: Staff cannot delete menus." }

    try {
        const menuItem = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } })
        if (!menuItem || menuItem.category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        await prisma.menuItem.update({ 
            where: { id },
            data: { isDeleted: true }
        })
        revalidatePath('/dashboard/store/menu')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ဖျက်ဆီးခြင်း မအောင်မြင်ပါ" }
    }
}

// ၅။ ဖျက်ထားသော မီနူးများ ဆွဲထုတ်ရန် (Trash)
export async function getDeletedMenuItems() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, data: [] }

    try {
        const data = await prisma.menuItem.findMany({
            where: { 
                category: { branchId: session.user.branchId },
                isDeleted: true
            },
            include: {
                category: { select: { name: true } }
            },
            orderBy: { updatedAt: 'desc' }
        })
        return { success: true, data }
    } catch (error) {
        return { success: false, data: [] }
    }
}

// ၆။ ဖျက်ထားသော မီနူးကို ပြန်ယူရန် (Restore)
export async function restoreMenuItem(id: string) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }
    if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied" }

    try {
        const menuItem = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } })
        if (!menuItem || menuItem.category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        await prisma.menuItem.update({ 
            where: { id },
            data: { isDeleted: false }
        })
        revalidatePath('/dashboard/store/menu')
        revalidatePath('/dashboard/store/settings')
        return { success: true }
    } catch (error) {
        return { success: false, error: "ပြန်လည်ရယူခြင်း မအောင်မြင်ပါ" }
    }
}

// ၇။ ဖျက်ထားသော မီနူးကို အပြီးတိုင်ဖျက်ရန် (Permanent Delete)
export async function permanentlyDeleteMenuItem(id: string) {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, error: "Unauthorized" }
    if (session.user.role === 'STAFF') return { success: false, error: "Permission Denied" }

    try {
        const menuItem = await prisma.menuItem.findUnique({ where: { id }, include: { category: true } })
        if (!menuItem || menuItem.category.branchId !== session.user.branchId) return { success: false, error: "Unauthorized" }

        await prisma.menuItem.delete({ where: { id } })
        revalidatePath('/dashboard/store/settings')
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2003') {
            return { success: false, error: "ဤမီနူးသည် ယခင်က အော်ဒါမှာယူထားဖူးသော မှတ်တမ်းရှိနေသဖြင့် အပြီးတိုင်ဖျက်၍ မရနိုင်ပါ။ (Soft Delete အနေဖြင့်သာ အမှိုက်ပုံးထဲတွင် ထားရှိနိုင်ပါမည်)" }
        }
        return { success: false, error: "အပြီးတိုင်ဖျက်ခြင်း မအောင်မြင်ပါ" }
    }
}

// ၅။ Addon Categories အားလုံး ဆွဲထုတ်ရန် (Helper)
export async function getAddonCategories() {
    const session = await auth()
    if (!session?.user?.branchId) return { success: false, data: [] }

    try {
        const data = await prisma.addonCategory.findMany({
            where: { branchId: session.user.branchId },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data }
    } catch (error) {
        return { success: false, data: [] }
    }
}