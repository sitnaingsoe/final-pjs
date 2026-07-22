// components/ui/InputField.tsx
'use client'

import React from 'react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export default function InputField({ label, name, required, ...props }: InputFieldProps) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-3xs font-black text-gray-500 uppercase tracking-wider">
                    {label} {required && <span className="text-black">*</span>}
                </label>
            )}
            <input
                name={name}
                required={required}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-black text-black placeholder-slate-600 transition disabled:opacity-50"
                {...props}
            />
        </div>
    )
}