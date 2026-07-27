// app/dashboard/store/invoices/page.tsx
import React from 'react'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getStoreInvoices(branchId: string) {
    return await prisma.invoice.findMany({
        where: { branchId },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function StoreInvoicesPage() {
    const session = await auth()

    if (!session?.user?.branchId) {
        redirect('/login')
    }

    const invoices = await getStoreInvoices(session.user.branchId)

    // Calculate total settled revenue
    const overallTotal = invoices.reduce((sum, inv) => inv.paymentStatus === 'PAID' ? sum + inv.finalAmount : sum, 0)

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Area + Financial Stat Card */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">Invoice Ledger</h1>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            သင့်ဆိုင်ခွဲ၏ နေ့စဉ် အရောင်းပြေစာ မှတ်တမ်းများကို ဤနေရာတွင် စစ်ဆေးနိုင်ပါသည်
                        </p>
                    </div>
                </div>

                {/* ရောင်းရငွေပြသသည့် Quick Stat Box */}
                <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl flex flex-col justify-center min-w-[220px] shadow-sm">
                    <div className="flex items-center gap-2 mb-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Settled (စုစုပေါင်း ဝင်ငွေ)</span>
                    </div>
                    <span className="text-xl font-black text-black font-mono">
                        {overallTotal.toLocaleString()} <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">MMK</span>
                    </span>
                </div>
            </div>

            {/* Invoices List Table */}
            <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-gray-100/50 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        </div>
                        <h2 className="text-base font-black uppercase tracking-wider text-black">
                            Invoice Registry <span className="font-bold text-gray-400 tracking-normal ml-1 text-sm">({invoices.length})</span>
                        </h2>
                    </div>
                    <a 
                        href="/api/export/invoices" 
                        download="invoices.csv"
                        className="group relative inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden shrink-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Export to CSV</span>
                    </a>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-700 min-w-[1000px]">
                        <thead className="text-xs uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="pb-4 pl-4 font-black">Invoice No.</th>
                                <th className="pb-4 font-black">Payment Method</th>
                                <th className="pb-4 text-right font-black">Sub Total</th>
                                <th className="pb-4 text-right font-black">Tax (5%)</th>
                                <th className="pb-4 text-right font-black">Discount</th>
                                <th className="pb-4 text-right font-black">Final Amount</th>
                                <th className="pb-4 text-center font-black">Status</th>
                                <th className="pb-4 text-right pr-4 font-black">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">No Invoices Found</h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase">POS မှ ငွေရှင်းပြီးသော ဘေလ်များ ဤနေရာတွင် ပေါ်လာပါမည်</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-black/5 transition-colors group">
                                        {/* Invoice Number */}
                                        <td className="py-4 pl-4 font-black text-black font-mono">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] uppercase tracking-widest mr-2 group-hover:bg-black group-hover:text-white transition-colors">#{invoice.invoiceNumber}</span>
                                        </td>

                                        {/* Payment Method */}
                                        <td className="py-4">
                                            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-600 font-black uppercase text-[10px] tracking-widest shadow-sm">
                                                {invoice.paymentMethod}
                                            </span>
                                        </td>

                                        {/* Financial Breakdowns */}
                                        <td className="py-4 text-right font-mono text-gray-500 font-bold">{invoice.subTotal.toLocaleString()}</td>
                                        <td className="py-4 text-right font-mono text-gray-400 font-medium">{invoice.taxAmount.toLocaleString()}</td>
                                        <td className="py-4 text-right font-mono text-red-500 font-bold">-{invoice.discountAmount.toLocaleString()}</td>
                                        <td className="py-4 text-right font-mono font-black text-black">{invoice.finalAmount.toLocaleString()}</td>

                                        {/* Payment Status Badges */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${invoice.paymentStatus === 'PAID'
                                                    ? 'bg-green-50 text-green-700'
                                                    : invoice.paymentStatus === 'UNPAID'
                                                        ? 'bg-amber-50 text-amber-600'
                                                        : 'bg-red-50 text-red-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${invoice.paymentStatus === 'PAID' ? 'bg-green-500' : invoice.paymentStatus === 'UNPAID' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                                                {invoice.paymentStatus}
                                            </span>
                                        </td>

                                        {/* Date formatted */}
                                        <td className="py-4 text-right pr-4 text-gray-400 font-mono font-bold text-xs uppercase tracking-widest">
                                            {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
