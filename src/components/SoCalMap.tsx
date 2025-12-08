'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { SOCAL_CITIES } from '@/lib/socal-cities'

// Fix for default marker icon in Next.js
import L from 'leaflet'
const iconRetinaUrl = 'leaflet/dist/images/marker-icon-2x.png'
const iconUrl = 'leaflet/dist/images/marker-icon.png'
const shadowUrl = 'leaflet/dist/images/marker-shadow.png'

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
})

interface SoCalMapProps {
    connectedCities: string[]
}

// Component to handle map resizing and initialization tweaks
function MapController() {
    const map = useMap()

    useEffect(() => {
        map.invalidateSize()
    }, [map])

    return null
}

export default function SoCalMap({ connectedCities }: SoCalMapProps) {
    // Center roughly on Orange County / Intersection of major counties
    const center: [number, number] = [33.8, -117.8]
    const zoom = 8.5

    return (
        <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Custom Grid Overlay - Pure CSS "Palantir" Grid */}
            <div className="absolute inset-0 z-[400] pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />

            {/* Vignette for cinematic look */}
            <div className="absolute inset-0 z-[401] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,0,20,0.6)_100%)]" />

            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    opacity={0.9}
                />

                <MapController />

                {Object.entries(SOCAL_CITIES).map(([city, coords]) => {
                    const isConnected = connectedCities.includes(city)

                    // If connected, show bright purple. If not, maybe show faint grey or hide?
                    // Let's show faint grey for context so the map isn't empty, but highlight connected ones.

                    return (
                        <CircleMarker
                            key={city}
                            center={coords}
                            radius={isConnected ? 8 : 3}
                            pathOptions={{
                                fillColor: isConnected ? '#a855f7' : '#475569',
                                fillOpacity: isConnected ? 0.8 : 0.3,
                                color: isConnected ? '#d8b4fe' : 'transparent',
                                weight: isConnected ? 2 : 0,
                            }}
                        >
                            <Popup className="glass-popup">
                                <div className="text-sm font-semibold">
                                    {city}
                                    {isConnected && <span className="block text-xs text-purple-600 font-bold mt-1">✓ Database Connected</span>}
                                    {!isConnected && <span className="block text-xs text-slate-500 mt-1">No Data Available</span>}
                                </div>
                            </Popup>
                        </CircleMarker>
                    )
                })}
            </MapContainer>

            {/* Legend / Status Overlay */}
            <div className="absolute bottom-4 left-4 z-[402] bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg text-xs text-slate-300">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                    <span className="text-white font-medium">Active Data Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                    <span>No Coverage</span>
                </div>
            </div>
        </div>
    )
}
