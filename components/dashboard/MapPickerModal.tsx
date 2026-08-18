// components/dashboard/MapPickerModal.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface MapPickerModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectLocation: (location: { lat: number; lng: number; address?: string }) => void
    initialLat?: number | null
    initialLng?: number | null
    initialAddress?: string
}

export default function MapPickerModal({
    isOpen,
    onClose,
    onSelectLocation,
    initialLat,
    initialLng,
    initialAddress = ''
}: MapPickerModalProps) {
    const [mounted, setMounted] = useState(false)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markerInstanceRef = useRef<any>(null)

    // Default to Yangon center if no coordinates
    const defaultLat = initialLat && !isNaN(initialLat) ? initialLat : 16.8409
    const defaultLng = initialLng && !isNaN(initialLng) ? initialLng : 96.1735

    const [selectedLat, setSelectedLat] = useState<number>(defaultLat)
    const [selectedLng, setSelectedLng] = useState<number>(defaultLng)
    const [addressText, setAddressText] = useState<string>(initialAddress)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
    const [manualCoordInput, setManualCoordInput] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Initialize Map when modal opens
    useEffect(() => {
        if (!isOpen || !mounted) return

        let isCancelled = false

        async function initLeaflet() {
            // Load leaflet CSS if not already loaded
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link')
                link.id = 'leaflet-css'
                link.rel = 'stylesheet'
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
                document.head.appendChild(link)
            }

            const L = (await import('leaflet')).default

            // Fix default marker icon issue with Leaflet in Next.js bundlers
            const customIcon = L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })

            if (isCancelled || !mapContainerRef.current) return

            // If map already exists, remove it before re-initializing
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
            }

            const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 14)
            mapInstanceRef.current = map

            // Add high-resolution OpenStreetMap Tile Layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map)

            // Add Draggable Pin Marker
            const marker = L.marker([defaultLat, defaultLng], {
                draggable: true,
                icon: customIcon
            }).addTo(map)
            markerInstanceRef.current = marker

            const updateCoordinates = (lat: number, lng: number) => {
                setSelectedLat(parseFloat(lat.toFixed(6)))
                setSelectedLng(parseFloat(lng.toFixed(6)))
                reverseGeocode(lat, lng)
            }

            // Click anywhere on map to reposition pin
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng
                marker.setLatLng([lat, lng])
                updateCoordinates(lat, lng)
            })

            // Drag pin to reposition
            marker.on('dragend', () => {
                const latlng = marker.getLatLng()
                updateCoordinates(latlng.lat, latlng.lng)
            })

            // Trigger resize after rendering in modal
            setTimeout(() => {
                map.invalidateSize()
            }, 250)
        }

        initLeaflet()

        return () => {
            isCancelled = true
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [isOpen, mounted, defaultLat, defaultLng])

    // Reverse Geocoding via Nominatim
    const reverseGeocode = async (lat: number, lng: number) => {
        setIsReverseGeocoding(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            if (res.ok) {
                const data = await res.json()
                if (data.display_name) {
                    setAddressText(data.display_name)
                }
            }
        } catch (e) {
            console.warn("Reverse geocoding error:", e)
        } finally {
            setIsReverseGeocoding(false)
        }
    }

    // Search Places (Forward Geocoding)
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        setSearchResults([])
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`)
            if (res.ok) {
                const data = await res.json()
                setSearchResults(data)
            }
        } catch (e) {
            console.error("Search error:", e)
        } finally {
            setIsSearching(false)
        }
    }

    // Jump map to a search result
    const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string }) => {
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        setSelectedLat(lat)
        setSelectedLng(lng)
        setAddressText(result.display_name)
        setSearchResults([])
        setSearchQuery('')

        if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16)
            markerInstanceRef.current.setLatLng([lat, lng])
        }
    }

    // Parse Google Maps Coordinates / Link Paste (e.g. "16.8409, 96.1735" or "@16.8409,96.1735")
    const handleParseManualCoords = () => {
        if (!manualCoordInput.trim()) return
        const regex = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/
        const match = manualCoordInput.match(regex)
        if (match) {
            const parts = match[0].split(',').map(s => parseFloat(s.trim()))
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const lat = parts[0]
                const lng = parts[1]
                setSelectedLat(lat)
                setSelectedLng(lng)
                setManualCoordInput('')
                if (mapInstanceRef.current && markerInstanceRef.current) {
                    mapInstanceRef.current.flyTo([lat, lng], 16)
                    markerInstanceRef.current.setLatLng([lat, lng])
                }
                reverseGeocode(lat, lng)
                return
            }
        }
        alert('Invalid coordinates format. Please enter as "16.8409, 96.1735"')
    }

    // Detect GPS location
    const handleGetGPS = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = parseFloat(pos.coords.latitude.toFixed(6))
                const lng = parseFloat(pos.coords.longitude.toFixed(6))
                setSelectedLat(lat)
                setSelectedLng(lng)
                setIsLocating(false)

                if (mapInstanceRef.current && markerInstanceRef.current) {
                    mapInstanceRef.current.flyTo([lat, lng], 16)
                    markerInstanceRef.current.setLatLng([lat, lng])
                }
                reverseGeocode(lat, lng)
            },
            (err) => {
                alert('Could not retrieve GPS location: ' + err.message)
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleConfirm = () => {
        onSelectLocation({
            lat: selectedLat,
            lng: selectedLng,
            address: addressText
        })
        onClose()
    }

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose}></div>

            {/* Modal Dialog */}
            <div className="bg-card rounded-[2rem] w-full max-w-4xl max-h-[95vh] flex flex-col relative z-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-border/50 animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-5 sm:p-6 bg-card border-b border-border/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Interactive Map Location Picker</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Click on the map or search to pick branch location</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                    
                    {/* Search & Quick Action Toolbar */}
                    <div className="p-4 bg-card/80 border-b border-border/50 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
                        
                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="relative flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                <input
                                    type="text"
                                    placeholder="Search place / street (e.g. Hledan, Yangon, Mandalay)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs bg-muted/50 border border-border/80 rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 disabled:opacity-50"
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </button>
                        </form>

                        {/* Quick Tools */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* GPS Button */}
                            <button
                                type="button"
                                onClick={handleGetGPS}
                                disabled={isLocating}
                                className="px-3.5 py-2 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 border border-orange-200/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                title="Detect Current GPS Location"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
                                <span>{isLocating ? "Locating..." : "My GPS"}</span>
                            </button>

                            {/* Google Maps External Helper */}
                            <a
                                href={`https://www.google.com/maps?q=${selectedLat},${selectedLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 bg-muted/60 hover:bg-muted text-foreground border border-border/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                title="Open location in Google Maps"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                                <span>Google Maps</span>
                            </a>
                        </div>
                    </div>

                    {/* Search Results Dropdown Preview */}
                    {searchResults.length > 0 && (
                        <div className="bg-card border-b border-border p-2 max-h-40 overflow-y-auto space-y-1 shadow-inner custom-scrollbar">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black px-2 pt-1">Select a matching location:</p>
                            {searchResults.map((res, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectSearchResult(res)}
                                    className="w-full text-left p-2.5 rounded-xl hover:bg-orange-500/10 hover:text-orange-600 transition-colors text-xs font-medium flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span className="truncate">{res.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Map Canvas Container */}
                    <div className="relative flex-1 min-h-[350px] w-full">
                        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0"></div>
                        
                        {/* Overlay Instruction Banner */}
                        <div className="absolute top-3 left-3 z-[400] bg-card/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-border/80 shadow-md pointer-events-none">
                            <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                                Click or drag the marker to set location
                            </p>
                        </div>
                    </div>

                    {/* Footer: Selected Location Bar & Confirm Actions */}
                    <div className="p-5 sm:p-6 bg-card border-t border-border/50 shrink-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            
                            {/* Selected Coordinates */}
                            <div className="bg-muted/40 border border-border/80 p-3 rounded-2xl flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Selected Coordinates</span>
                                    <span className="text-xs font-mono font-bold text-foreground">
                                        Lat: {selectedLat} , Lng: {selectedLng}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="text"
                                        placeholder="Paste coords..."
                                        value={manualCoordInput}
                                        onChange={(e) => setManualCoordInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleParseManualCoords()}
                                        className="w-28 px-2 py-1 text-[11px] bg-card border border-border rounded-lg font-mono text-foreground focus:outline-none"
                                        title="Paste Google Maps Coordinates (e.g. 16.8409, 96.1735)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleParseManualCoords}
                                        className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded-lg uppercase tracking-wider"
                                    >
                                        Go
                                    </button>
                                </div>
                            </div>

                            {/* Detected Address Preview */}
                            <div className="bg-muted/40 border border-border/80 p-3 rounded-2xl">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                    <span>Detected Address</span>
                                    {isReverseGeocoding && <span className="text-orange-500 font-bold animate-pulse text-[9px]">(Detecting...)</span>}
                                </span>
                                <input
                                    type="text"
                                    value={addressText}
                                    onChange={(e) => setAddressText(e.target.value)}
                                    placeholder="Address will be auto-filled or type manually..."
                                    className="w-full mt-0.5 text-xs bg-transparent border-none p-0 text-foreground font-medium focus:outline-none truncate"
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>Apply Location</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    )
}
