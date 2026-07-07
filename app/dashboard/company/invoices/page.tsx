// app/dashboard/invoices/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

// 🚀 Backend Data Fetching Logic (Role အလိုက် ဒေတာဆွဲထုတ်ခြင်း)
async function getInvoices(role: string, branchId: string | null | undefined) {
    if (role === 'COMPANY_HEAD') {
        // Owner ဆိုလျှင် ဆိုင်ခွဲအားလုံး၏ ဘေလ်များကို ဆွဲထုတ်ပြီး ဆိုင်ခွဲအမည်ပါ တွဲယူမည်
        return await prisma.invoice.findMany({
            include: {
                branch: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    } else {
        // ဆိုင်ခွဲဝန်ထမ်း/မန်နေဂျာ ဆိုလျှင် မိမိဆိုင်ခွဲတစ်ခုတည်းကိုသာ Filter ချမည်
        return await prisma.invoice.findMany({
            where: { branchId: branchId || "" },
            include: {
                branch: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    }
}

export default async function InvoicesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const { role, branchId } = session.user
    const invoices = await getInvoices(role!, branchId)

    // စုစုပေါင်း ရောင်းရငွေအားလုံးကို ပေါင်းတွက်ခြင်း
    const overallTotal = invoices.reduce((sum, inv) => inv.paymentStatus === 'PAID' ? sum + inv.finalAmount : sum, 0)

    return (
        <div className="space-y-6 text-white min-h-screen">

            {/* Header Area + Financial Stat Card */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-wider text-orange-500">🧾 Invoice Ledger</h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {role === 'COMPANY_HEAD' ? 'လုပ်ငန်းစုတစ်ခုလုံး၏ ငွေရှင်းပြီးသား ဘေလ်မှတ်တမ်းများချုပ်' : 'သင့်ဆိုင်ခွဲ၏ အရောင်းပြေစာ မှတ်တမ်းများ'}
                    </p>
                </div>

                {/* ရောင်းရငွေပြသသည့် Quick Stat Box */}
                <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-xl flex flex-col justify-center min-w-[200px]">
                    <span className="text-3xs font-black text-slate-500 uppercase tracking-wider">Total Settled (စုစုပေါင်းဝင်ငွေ)</span>
                    <span className="text-md font-black text-green-400 font-mono mt-0.5">
                        {overallTotal.toLocaleString()} <span className="text-3xs font-bold text-slate-400">MMK</span>
                    </span>
                </div>
            </div>

            {/* 🧾 Invoices List Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold uppercase text-slate-200">Invoice Registry ({invoices.length})</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-2xs uppercase font-bold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3">Invoice No.</th>
                                {role === 'COMPANY_HEAD' && <th className="p-3">Branch</th>}
                                <th className="p-3">Payment Method</th>
                                <th className="p-3 text-right">Sub Total</th>
                                <th className="p-3 text-right">Tax (5%)</th>
                                <th className="p-3 text-right">Discount</th>
                                <th className="p-3 text-right">Final Amount</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={role === 'COMPANY_HEAD' ? 9 : 8} className="p-8 text-center text-slate-500">
                                        မည်သည့် ပြေစာမှတ်တမ်းမျှ မရှိသေးပါ။
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-900/40 transition">
                                        {/* Invoice Number */}
                                        <td className="p-3 font-bold text-white font-mono">{invoice.invoiceNumber}</td>

                                        {/* Company Head သာ မြင်ရမည့် ဆိုင်ခွဲအမည် */}
                                        {role === 'COMPANY_HEAD' && (
                                            <td className="p-3 text-slate-400 font-medium">{invoice.branch.name}</td>
                                        )}

                                        {/* Payment Method */}
                                        <td className="p-3">
                                            <span className="bg-slate-900 px-2 py-1 rounded-md text-slate-400 border border-slate-800 font-bold uppercase text-3xs">
                                                {invoice.paymentMethod}
                                            </span>
                                        </td>

                                        {/* Financial Breakdowns */}
                                        <td className="p-3 text-right font-mono text-slate-400">{invoice.subTotal.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono text-slate-500">{invoice.taxAmount.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono text-red-400/80">-{invoice.discountAmount.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono font-black text-orange-400">{invoice.finalAmount.toLocaleString()}</td>

                                        {/* Payment Status Badges */}
                                        <td className="p-3 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider border ${invoice.paymentStatus === 'PAID'
                                                    ? 'bg-green-950/40 border-green-800 text-green-400'
                                                    : invoice.paymentStatus === 'UNPAID'
                                                        ? 'bg-yellow-950/40 border-yellow-800 text-yellow-400'
                                                        : 'bg-red-950/40 border-red-800 text-red-400'
                                                }`}>
                                                {invoice.paymentStatus}
                                            </span>
                                        </td>

                                        {/* Date formatted */}
                                        <td className="p-3 text-center text-slate-500 font-mono">
                                            {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}