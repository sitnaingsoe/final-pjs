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
        <div className="hidden print:block absolute top-0 left-0 bg-white text-black text-[12px] font-mono p-4 w-[80mm] max-w-[80mm] mx-auto z-[9999]">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-1">Our Restaurant</h2>
                <p className="text-xs">123 Main Street, Yangon</p>
                <p className="text-xs">Phone: 09-123456789</p>
            </div>

            <div className="border-t border-b border-black border-dashed py-2 mb-2">
                <div className="flex justify-between">
                    <span>Order: #{data.orderId.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date: {new Date(data.date).toLocaleString('en-US', { hour12: true })}</span>
                </div>
            </div>

            {/* Items */}
            <div className="mb-2">
                <div className="flex justify-between font-bold border-b border-black pb-1 mb-1">
                    <span className="w-1/2">Item</span>
                    <span className="w-1/4 text-center">Qty</span>
                    <span className="w-1/4 text-right">Amt</span>
                </div>
                {data.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between mb-1">
                        <span className="w-1/2 break-words pr-1">{item.name}</span>
                        <span className="w-1/4 text-center">{item.quantity}</span>
                        <span className="w-1/4 text-right">{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t border-black border-dashed pt-2 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{data.totalAmount.toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax (5%):</span>
                    <span>{data.taxAmount.toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
                    <span>TOTAL:</span>
                    <span>{data.finalAmount.toLocaleString()} MMK</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
                <p className="font-bold">Thank You!</p>
                <p className="text-[10px] mt-1">Please come again.</p>
                <p className="text-[10px] mt-4">- - - - - - - - - - - - - - - - -</p>
            </div>
        </div>
    )
}
