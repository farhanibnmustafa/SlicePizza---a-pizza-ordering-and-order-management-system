'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import styles from './Map.module.css';

// Fix for default Leaflet icons in Next.js using reliable divIcons 
const DefaultIcon = L.divIcon({
    html: `<div style="font-size: 24px; text-align: center; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">📍</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

const ShopIcon = L.divIcon({
    html: `<div class="${styles.markerLabel}">🍕 SlicePizza</div>`,
    className: '',
    iconSize: [80, 20],
    iconAnchor: [40, 10],
});

const CarIcon = L.divIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">🚗</div>`, 
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// Shop coordinates (Simulated store in a central city location)
const SHOP_POSITION: [number, number] = [40.7128, -74.0060]; // NYC as default

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    
    // We only want to trigger a map bounds change when the actual coordinate values change, 
    // not every time the array reference changes (which is 60fps during carPos animation)
    const boundsString = JSON.stringify(bounds);
    
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boundsString, map]);
    return null;
}

interface MapViewProps {
    mode: 'picker' | 'tracker';
    onLocationSelect?: (lat: number, lng: number, address: string) => void;
    userLocation?: [number, number];
}

export default function MapView({ mode, onLocationSelect, userLocation }: MapViewProps) {
    const [center, setCenter] = useState<[number, number]>(userLocation || SHOP_POSITION);
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(userLocation || null);
    const [isLocating, setIsLocating] = useState(false);

    // Simulated tracking for 'tracker' mode
    const [carPos, setCarPos] = useState<[number, number]>(SHOP_POSITION);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            return data.display_name || 'Selected Location';
        } catch {
            return 'Selected Location';
        }
    };

    const handleMapClick = async (lat: number, lng: number) => {
        if (mode === 'picker') {
            setMarkerPos([lat, lng]);
            const address = await reverseGeocode(lat, lng);
            onLocationSelect?.(lat, lng, address);
        }
    };

    const handleLocate = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setCenter([latitude, longitude]);
                setMarkerPos([latitude, longitude]);
                const address = await reverseGeocode(latitude, longitude);
                onLocationSelect?.(latitude, longitude, address);
                setIsLocating(false);
            },
            () => setIsLocating(false)
        );
    };

    useEffect(() => {
        if (mode === 'tracker' && userLocation) {
            // Safe parsing in case db stored strings
            const destLat = Number(userLocation[0]);
            const destLng = Number(userLocation[1]);
            
            if (isNaN(destLat) || isNaN(destLng)) return;

            // Animate car from shop to user over 30 seconds
            const start = Date.now();
            const duration = 30000;
            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - start) / duration, 1);
                
                const currentLat = SHOP_POSITION[0] + (destLat - SHOP_POSITION[0]) * progress;
                const currentLng = SHOP_POSITION[1] + (destLng - SHOP_POSITION[1]) * progress;
                
                setCarPos([currentLat, currentLng]);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }
    }, [mode, userLocation]);

    return (
        <div className={styles.mapContainer}>
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className={styles.map}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {mode === 'picker' && (
                    <>
                        <MapEvents onLocationSelect={handleMapClick} />
                        <ChangeView center={center} />
                        {markerPos && <Marker position={markerPos} icon={DefaultIcon} />}
                    </>
                )}

                {mode === 'tracker' && userLocation && !isNaN(Number(userLocation[0])) && (
                    <>
                        <Marker position={SHOP_POSITION} icon={ShopIcon} />
                        <Marker position={[Number(userLocation[0]), Number(userLocation[1])]} icon={DefaultIcon}>
                            <Popup>Your Delivery Address</Popup>
                        </Marker>
                        <Marker position={carPos} icon={CarIcon} />
                        <FitBounds bounds={[SHOP_POSITION, [Number(userLocation[0]), Number(userLocation[1])]]} />
                    </>
                )}
            </MapContainer>

            {mode === 'picker' && (
                <div className={styles.controls}>
                    <button 
                        className={styles.controlBtn} 
                        onClick={handleLocate}
                        disabled={isLocating}
                        title="Find my location"
                    >
                        <LocateFixed size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
