// components/ui/InputField.tsx
'use client'

import React, { useState } from 'react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export default function InputField({ label, name, required, type, ...props }: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className="space-y-1.5 relative">
            {label && (
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {label} {required && <span className="text-black">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    name={name}
                    type={inputType}
                    required={required}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-black placeholder-slate-400 focus:outline-none focus:border-black transition-all shadow-sm focus:shadow-md disabled:opacity-50"
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}