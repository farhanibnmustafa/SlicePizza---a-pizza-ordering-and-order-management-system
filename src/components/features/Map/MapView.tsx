'use client';
import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, MapPin, Navigation } from 'lucide-react';
import styles from './Map.module.css';

// Fix for default Leaflet icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const ShopIcon = L.divIcon({
    html: `<div class="${styles.markerLabel}">🍕 SliceRush</div>`,
    className: '',
    iconSize: [80, 20],
    iconAnchor: [40, 10],
});

const CarIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3082/3082344.png', // Small car icon
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
        } catch (err) {
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
            // Animate car from shop to user over 30 seconds
            let start = Date.now();
            const duration = 30000;
            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - start) / duration, 1);
                
                const currentLat = SHOP_POSITION[0] + (userLocation[0] - SHOP_POSITION[0]) * progress;
                const currentLng = SHOP_POSITION[1] + (userLocation[1] - SHOP_POSITION[1]) * progress;
                
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

                {mode === 'tracker' && userLocation && (
                    <>
                        <Marker position={SHOP_POSITION} icon={ShopIcon} />
                        <Marker position={userLocation} icon={DefaultIcon}>
                            <Popup>Your Delivery Address</Popup>
                        </Marker>
                        <Marker position={carPos} icon={CarIcon} />
                        <ChangeView center={carPos} />
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
