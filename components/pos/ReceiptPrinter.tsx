'use client'

import React from 'react'

export type ReceiptData = {
    orderId: string;
    orderNumber?: number;
    tableNumber?: string;
    branchName?: string;
    cashierName?: string;
    paymentMethod?: string;
    date: Date | string;
    items: {
        name: string;
        price: number;
        quantity: number;
        addons?: { name: string; price: number }[];
    }[];
    totalAmount: number;
    taxAmount: number;
    discountAmount?: number;
    promoCode?: string;
    finalAmount: number;
    paperSize?: '58mm' | '80mm';
}

/**
 * 🖨️ Thermal Receipt Printer Component
 * Optimized for 80mm and 58mm POS Thermal Printers (USB, Bluetooth, Network).
 */
export default function ReceiptPrinter({ data }: { data: ReceiptData | null }) {
    if (!data) return null;

    const paperWidthClass = data.paperSize === '58mm' ? 'w-[58mm] max-w-[58mm]' : 'w-[80mm] max-w-[80mm]';
    const formattedDate = new Date(data.date).toLocaleString('en-US', {
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <>
        <style type="text/css">
            {`
                @media print {
                    @page { 
                        margin: 0; 
                        size: ${data.paperSize === '58mm' ? '58mm auto' : '80mm auto'}; 
                    }
                    body { 
                        margin: 0; 
                        background: #ffffff !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                }
            `}
        </style>
        <div className={`hidden print:block bg-white text-black font-mono text-xs p-2 sm:p-4 ${paperWidthClass} mx-auto z-[9999] print:w-full print:max-w-full print:p-1`}>
            
            {/* 🏢 Store Header */}
            <div className="text-center mb-4">
                <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-1 font-black text-lg">
                    B
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight leading-tight">
                    {data.branchName || 'BiteCraft POS'}
                </h2>
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest mt-0.5">
                    Order Receipt
                </p>
            </div>

            {/* 📋 Order Metadata */}
            <div className="border-t-2 border-b-2 border-black border-dashed py-2 mb-3 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                    <span className="font-black uppercase">Order ID:</span>
                    <span className="font-mono font-bold">#{data.orderId.substring(0, 8).toUpperCase()}</span>
                </div>
                {data.tableNumber && (
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="font-black uppercase">Table / Section:</span>
                        <span className="font-mono font-bold">{data.tableNumber}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold uppercase text-gray-700">Date & Time:</span>
                    <span className="font-mono">{formattedDate}</span>
                </div>
                {data.cashierName && (
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold uppercase text-gray-700">Cashier:</span>
                        <span className="font-mono">{data.cashierName}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold uppercase text-gray-700">Payment:</span>
                    <span className="font-mono font-bold">{data.paymentMethod || 'CASH'}</span>
                </div>
            </div>

            {/* 🍽️ Items Table */}
            <div className="mb-3">
                <div className="flex justify-between font-black uppercase text-[11px] border-b-2 border-black pb-1.5 mb-2">
                    <span className="w-6/12 text-left">Item</span>
                    <span className="w-2/12 text-center">Qty</span>
                    <span className="w-4/12 text-right">Amount</span>
                </div>
                <div className="space-y-2">
                    {data.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col text-[11px] leading-snug">
                            <div className="flex items-start justify-between font-bold">
                                <span className="w-6/12 break-words pr-1">{item.name}</span>
                                <span className="w-2/12 text-center font-mono">{item.quantity}</span>
                                <span className="w-4/12 text-right font-mono tabular-nums">
                                    {(item.price * item.quantity).toLocaleString()} Ks
                                </span>
                            </div>
                            {/* Optional Addons */}
                            {item.addons && item.addons.length > 0 && (
                                <div className="pl-2 text-[9px] text-gray-600 font-medium">
                                    {item.addons.map((a, aIdx) => (
                                        <div key={aIdx} className="flex justify-between">
                                            <span>+ {a.name}</span>
                                            <span>{a.price > 0 ? `${a.price.toLocaleString()} Ks` : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 💰 Financial Totals */}
            <div className="border-t-2 border-black border-dashed pt-2 space-y-1">
                <div className="flex justify-between text-[11px]">
                    <span className="font-bold">Subtotal:</span>
                    <span className="font-mono tabular-nums">{data.totalAmount.toLocaleString()} Ks</span>
                </div>
                
                {data.discountAmount && data.discountAmount > 0 && (
                    <div className="flex justify-between text-[11px] text-red-600 font-bold">
                        <span>Discount ({data.promoCode || 'PROMO'}):</span>
                        <span className="font-mono tabular-nums">-{data.discountAmount.toLocaleString()} Ks</span>
                    </div>
                )}

                <div className="flex justify-between text-[11px]">
                    <span className="font-bold">Tax (5%):</span>
                    <span className="font-mono tabular-nums">{data.taxAmount.toLocaleString()} Ks</span>
                </div>

                <div className="flex justify-between text-sm font-black border-t-2 border-black pt-1.5 mt-1.5">
                    <span>NET TOTAL:</span>
                    <span className="font-mono tabular-nums">{data.finalAmount.toLocaleString()} Ks</span>
                </div>
            </div>

            {/* 🏁 Footer & Barcode */}
            <div className="text-center mt-6 pt-3 border-t-2 border-black border-solid">
                <p className="font-black text-xs uppercase tracking-widest mb-0.5">Thank You!</p>
                <p className="text-[10px] font-bold">ကျေးဇူးတင်ပါသည်ခင်ဗျာ။ နောက်လည်း ကြွလှမ်းခဲ့ပါဦး။</p>

                {/* Mock Thermal Barcode */}
                <div className="mt-3 flex flex-col items-center">
                    <div className="h-7 w-3/4 border-l-2 border-r-[3px] border-black flex gap-[2px] justify-center bg-black/5">
                        <div className="w-[3px] bg-black h-full"></div>
                        <div className="w-[1px] bg-black h-full"></div>
                        <div className="w-[4px] bg-black h-full"></div>
                        <div className="w-[2px] bg-black h-full"></div>
                        <div className="w-[5px] bg-black h-full"></div>
                        <div className="w-[1px] bg-black h-full"></div>
                        <div className="w-[3px] bg-black h-full"></div>
                        <div className="w-[2px] bg-black h-full"></div>
                        <div className="w-[4px] bg-black h-full"></div>
                    </div>
                    <span className="text-[9px] font-mono mt-0.5">{data.orderId.substring(0, 12).toUpperCase()}</span>
                </div>

                <p className="text-[8px] mt-3 text-gray-500 font-bold uppercase tracking-widest">
                    BiteCraft POS Thermal Print Module
                </p>
            </div>
        </div>
        </>
    )
}
