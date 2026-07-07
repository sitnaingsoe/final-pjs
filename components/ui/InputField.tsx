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
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-wider">
                    {label} {required && <span className="text-orange-500">*</span>}
                </label>
            )}
            <input
                name={name}
                required={required}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-orange-500 text-white placeholder-slate-600 transition disabled:opacity-50"
                {...props}
            />
        </div>
    )
}