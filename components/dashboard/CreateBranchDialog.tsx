// components/dashboard/CreateBranchDialog.tsx
'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createBranchWithAdmin } from '@/server/actions/branch'
import { useRouter } from 'next/navigation'
import InputField from '../ui/InputField'
import MapPickerModal from './MapPickerModal'

export default function CreateBranchDialog({ companyId }: { companyId: string }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [lat, setLat] = useState<string>('')
    const [lng, setLng] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [isLocating, setIsLocating] = useState(false)
    const [isMapOpen, setIsMapOpen] = useState(false)

    useEffect(() => setMounted(true), [])

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude.toFixed(6))
                setLng(pos.coords.longitude.toFixed(6))
                setIsLocating(false)
            },
            (err) => {
                console.error('Geolocation error:', err)
                alert('Could not retrieve GPS location: ' + err.message)
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleMapLocationSelected = (location: { lat: number; lng: number; address?: string }) => {
        setLat(location.lat.toString())
        setLng(location.lng.toString())
        if (location.address && !address) {
            setAddress(location.address)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        formData.append('companyId', companyId)

        startTransition(async () => {
            setError(null)
            const res = await createBranchWithAdmin(formData)
            if (res.success) {
                setIsOpen(false)
                router.refresh()
            } else {
                setError(res.error || "အမှားတစ်ခုခု ရှိနေပါသည်")
            }
        })
    }

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden shrink-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <span>Add New Branch</span>
            </button>

            {/* Dialog Overlay & Box via Portal */}
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => !isPending && setIsOpen(false)}></div>

                    <div className="bg-card rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border/60">
                        {/* Header */}
                        <div className="bg-card border-b border-border/50 p-6 sm:p-8 flex justify-between items-start shrink-0">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Create Branch Structure</h3>
                                    <p className="text-xs text-muted-foreground mt-1 font-semibold">Set up a new branch and assign its manager</p>
                                </div>
                            </div>
                            <button onClick={() => !isPending && setIsOpen(false)} className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 sm:p-8 bg-card overflow-y-auto custom-scrollbar flex-1">
                            {/* Error Handling */}
                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form action={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Left Side: Branch Info */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-black text-white">1</div>
                                            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Branch Profile</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <InputField label="Branch Name" name="branchName" placeholder="e.g. Hledan Branch" required disabled={isPending} />
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Full address (e.g. Insein Road, Kamayut, Yangon)"
                                                    disabled={isPending}
                                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 transition-all font-medium"
                                                />
                                            </div>
                                            <InputField label="Phone" name="phone" placeholder="Contact number" disabled={isPending} />
                                            
                                            {/* Geolocation Section */}
                                            <div className="pt-2 border-t border-border/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                                                        GPS Coordinates
                                                    </label>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsMapOpen(true)}
                                                            disabled={isPending}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-1 rounded-lg border border-orange-500/30 transition-colors shadow-sm"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                            <span>📍 Pick on Map</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={handleGetCurrentLocation}
                                                            disabled={isPending || isLocating}
                                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-200/50 transition-colors disabled:opacity-50"
                                                            title="Get GPS location"
                                                        >
                                                            {isLocating ? (
                                                                <span className="animate-pulse">Detecting...</span>
                                                            ) : (
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
                                                                    <span>GPS</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            name="latitude"
                                                            placeholder="Latitude (e.g. 16.8409)"
                                                            value={lat}
                                                            onChange={(e) => setLat(e.target.value)}
                                                            disabled={isPending}
                                                            className="w-full px-3 py-2 text-xs bg-muted/40 border border-border/80 rounded-xl font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            name="longitude"
                                                            placeholder="Longitude (e.g. 96.1735)"
                                                            value={lng}
                                                            onChange={(e) => setLng(e.target.value)}
                                                            disabled={isPending}
                                                            className="w-full px-3 py-2 text-xs bg-muted/40 border border-border/80 rounded-xl font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Admin User Info */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-black text-white">2</div>
                                            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Assigned Manager</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <InputField label="Manager Name" name="adminName" placeholder="John Doe" required disabled={isPending} />
                                            <InputField label="Email Address" type="email" name="adminEmail" placeholder="john@company.com" required disabled={isPending} />
                                            <InputField label="Password" type="password" name="adminPassword" placeholder="••••••••" required disabled={isPending} />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Buttons */}
                                <div className="flex justify-end gap-3 pt-8 border-t border-border/50">
                                    <button type="button" onClick={() => setIsOpen(false)} disabled={isPending} className="bg-card hover:bg-muted/50 border border-border text-muted-foreground hover:text-foreground font-bold px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors shadow-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isPending} className="group relative bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2">
                                        {isPending ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Building...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm Create</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Interactive Map Location Picker Modal */}
            <MapPickerModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelectLocation={handleMapLocationSelected}
                initialLat={lat ? parseFloat(lat) : null}
                initialLng={lng ? parseFloat(lng) : null}
                initialAddress={address}
            />
        </>
    )
}