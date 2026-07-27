'use client'

import React from 'react'

export type ReceiptData = {
    orderId: string;
    date: Date;
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
    taxAmount: number;
    finalAmount: number;
}

export default function ReceiptPrinter({ data }: { data: ReceiptData | null }) {
    if (!data) return null;

    return (
        <>
        <style type="text/css">
            {`
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body { margin: 0; }
                }
            `}
        </style>
        <div className="hidden print:block bg-white text-black text-sm font-mono p-4 w-[80mm] max-w-[80mm] mx-auto z-[9999] print:w-full print:max-w-full">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl font-black">B</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">BiteCraft</h2>
                <p className="text-xs font-bold text-gray-800">123 Main Street, Yangon</p>
                <p className="text-xs font-bold text-gray-800">Te: 09-123456789</p>
            </div>

            {/* Order Info */}
            <div className="border-t-2 border-b-2 border-black border-dashed py-3 mb-4 space-y-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase">Order No:</span>
                    <span className="font-mono">{data.orderId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase">Date:</span>
                    <span className="font-mono">{new Date(data.date).toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Items */}
            <div className="mb-4">
                <div className="flex justify-between font-black uppercase text-xs border-b-2 border-black pb-2 mb-2">
                    <span className="w-7/12 text-left">Item</span>
                    <span className="w-1/12 text-center">Q</span>
                    <span className="w-4/12 text-right">Amount</span>
                </div>
                <div className="space-y-2">
                    {data.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex items-start justify-between leading-snug">
                            <span className="w-7/12 break-words pr-2 font-bold">{item.name}</span>
                            <span className="w-1/12 text-center font-mono">{item.quantity}</span>
                            <span className="w-4/12 text-right font-mono tabular-nums">{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-black border-dashed pt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                    <span className="font-bold">Subtotal</span>
                    <span className="font-mono tabular-nums">{data.totalAmount.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="font-bold">Tax (5%)</span>
                    <span className="font-mono tabular-nums">{data.taxAmount.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between text-base font-black border-t-2 border-black pt-2 mt-2">
                    <span>TOTAL</span>
                    <span className="font-mono tabular-nums">{data.finalAmount.toLocaleString()} Ks</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-4 border-t-2 border-black border-solid">
                <p className="font-black text-sm uppercase tracking-widest mb-1">Thank You</p>
                <p className="text-xs font-bold">Please come again!</p>
                
                {/* Barcode Mockup */}
                <div className="mt-4 flex flex-col items-center">
                    <div className="h-8 w-4/5 border-l-2 border-r-[4px] border-black flex gap-[2px] justify-center bg-black/5">
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
                    <span className="text-[10px] font-mono mt-1">{data.orderId.substring(0,12).toUpperCase()}</span>
                </div>

                <p className="text-[9px] mt-4 text-gray-500 font-bold uppercase tracking-widest">BiteCraft POS Systems</p>
            </div>
        </div>
        </>
    )
}
