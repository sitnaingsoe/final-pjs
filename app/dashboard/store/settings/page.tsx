// app/(dashboard)/settings/page.tsx
import React from 'react'
import { getRestaurantSettings, updateRestaurantSettings } from '@/server/actions/settings'
import { getDeletedMenuItems } from '@/server/actions/menu'
import TrashSection from '@/components/settings/TrashSection'

export default async function SettingsPage() {
    const result = await getRestaurantSettings()
    const settings = result.data

    const deletedResult = await getDeletedMenuItems()
    const deletedItems = deletedResult.data || []

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl">
            {/* Page Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 glass ">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Configure your branch details and order status.</p>
                    </div>
                </div>
            </div>

            {/* á€•á€„á€ºá€™ á€†á€€á€ºá€ á€„á€ºá€–á€±á€¬á€„á€ºá€€á€¼á€®á€¸ */}
 <div className="glass relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>

                <form
                    action={async (formData) => {
                        'use server'
                        await updateRestaurantSettings(formData)
                    }}
                    className="space-y-8 relative z-10"
                >
                    {/* á€›á€¾á€­á€•á€¼á€®á€¸á€žá€¬á€¸ Setting ID á€€á€­á€¯ Backend á€žá€­á€¯á€· á€á€­á€¯á€¸á€•á€­á€¯á€·á€›á€”á€º Hidden Input */}
                    <input type="hidden" name="id" value={settings?.id || ''} />

                    {/* âš¡ á€†á€­á€¯á€„á€ºá€–á€½á€„á€·á€º/á€•á€­á€á€º á€‘á€­á€”á€ºá€¸á€á€»á€¯á€•á€ºá€žá€Šá€·á€º á€”á€±á€›á€¬ (UX Status Box) */}
                    <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-sm hover:shadow-md ${
                        settings?.isAcceptingOrders 
                        ? 'bg-green-50/50 border-green-200' 
                        : 'bg-red-50/50 border-red-200'
                    }`}>
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${settings?.isAcceptingOrders ? 'bg-green-100 text-green-600 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                                {settings?.isAcceptingOrders ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                )}
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg tracking-wide flex items-center gap-2 ${settings?.isAcceptingOrders ? 'text-green-700' : 'text-red-700'}`}>
                                    <span className={`w-2.5 h-2.5 rounded-full ${settings?.isAcceptingOrders ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    Order Status
                                </h4>
                                <p className={`text-[11px] font-semibold uppercase tracking-widest mt-1 ${settings?.isAcceptingOrders ? 'text-green-600/70' : 'text-red-600/70'}`}>
                                    Currently {settings?.isAcceptingOrders ? 'Accepting Orders' : 'Not Accepting Orders'}
                                </p>
                            </div>
                        </div>

                        <div className="relative shrink-0">
                            <select
                                name="isAcceptingOrders"
                                defaultValue={settings?.isAcceptingOrders ? 'true' : 'false'}
                                className={`appearance-none text-xs font-bold uppercase tracking-widest pl-5 pr-10 py-3.5 rounded-xl border focus:outline-none transition-all cursor-pointer shadow-sm ${
                                    settings?.isAcceptingOrders 
                                    ? 'bg-card border-green-200 text-green-700 focus:border-green-400 focus:ring-4 focus:ring-green-500/10' 
                                    : 'bg-card border-red-200 text-red-700 focus:border-red-400 focus:ring-4 focus:ring-red-500/10'
                                }`}
                            >
                                <option value="true" className="font-semibold">Accept Orders</option>
                                <option value="false" className="font-semibold">Pause Orders</option>
                            </select>
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${settings?.isAcceptingOrders ? 'text-green-500' : 'text-red-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>

                    {/* á€¡á€á€¼á€±á€á€¶ á€¡á€á€»á€€á€ºá€¡á€œá€€á€ºá€™á€»á€¬á€¸ */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Restaurant Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="restaurantName"
                                defaultValue={settings?.restaurantName || 'My Restaurant'}
                                className="w-full bg-card border border-border rounded-xl p-4 text-sm font-medium text-foreground placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm focus:shadow-md"
                                required
                            />
                        </div>
                    </div>

                    {/* á€žá€­á€™á€ºá€¸á€†á€Šá€ºá€¸á€™á€Šá€·á€º á€á€œá€¯á€á€º */}
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="relative bg-black hover:bg-gray-900 text-white text-xs uppercase tracking-wider font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover-lift flex items-center gap-2 group/btn overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:rotate-180 transition-transform duration-500"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                            Save Settings
                        </button>
                    </div>

                </form>
            </div>

            {/* Trash Section */}
            <TrashSection deletedItems={deletedItems} />
        </div>
    )
}