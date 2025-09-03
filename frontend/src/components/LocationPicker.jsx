import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Updated custom icons 
const startIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="3"/>
            <text x="16" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold">S</text>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="6">START</text>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const endIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="white" stroke-width="3"/>
            <text x="16" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold">E</text>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="6">END</text>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Component to handle map clicks - now only for END point
function MapClickHandler({ onEndChange, endCoords }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onEndChange({ lat, lng });
            console.log('End point set:', { lat, lng });
        },
    });

    return (
        <div className="leaflet-top leaflet-left" style={{ marginTop: '60px' }}>
            <div className="leaflet-control leaflet-bar" style={{ 
                background: 'white', 
                padding: '8px 12px',
                fontSize: '12px'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    📍 Click map to set END point
                </div>
                {endCoords && (
                    <div style={{ fontSize: '10px', color: '#16a34a' }}>
                        ✅ End point set!
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LocationPicker({ 
    startCoords, 
    endCoords, 
    onStartChange, 
    onEndChange, 
    mapCenter, 
    setMapCenter 
}) {
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    
    // Auto-get current location for start point when component mounts
    useEffect(() => {
        getCurrentLocation();
    }, []);
    
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            return;
        }
        
        setIsGettingLocation(true);
        setLocationError(null);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { lat: latitude, lng: longitude };
                
                // Set as start point
                onStartChange(currentLocation);
                
                // Center map on current location
                setMapCenter([latitude, longitude]);
                
                setIsGettingLocation(false);
                console.log('Current location set as start point:', currentLocation);
            },
            (error) => {
                console.error('Error getting location:', error);
                setLocationError('Unable to get your location. Please enable location services.');
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    };
    
    // Calculate distance if both points are set
    const calculateDistance = (start, end) => {
        if (!start || !end) return null;
        
        const R = 6371; // Earth's radius in km
        const dLat = (end.lat - start.lat) * Math.PI / 180;
        const dLon = (end.lng - start.lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    };
    
    const distance = calculateDistance(startCoords, endCoords);

    return (
        <div className="w-full max-w-2xl">
            {/* Status Header */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`flex items-center gap-2 text-sm ${startCoords ? 'text-green-600' : isGettingLocation ? 'text-blue-600' : 'text-gray-400'}`}>
                        🟢 Start: {
                            isGettingLocation ? 'Getting your location...' :
                            startCoords ? '✅ Current Location' :
                            locationError ? '❌ Location Error' : '❌ Not Set'
                        }
                    </div>
                </div>
                
                {locationError && (
                    <div className="text-red-600 text-xs mb-2">
                        {locationError}
                        <button 
                            onClick={getCurrentLocation}
                            className="ml-2 text-blue-600 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
                
                <div className={`flex items-center gap-2 text-sm ${endCoords ? 'text-red-600' : 'text-gray-400'}`}>
                    🔴 End: {endCoords ? '✅ Selected' : '❌ Click map to set'}
                </div>
            </div>

            {/* Map Container */}
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`}
                        attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <MapClickHandler 
                        onEndChange={onEndChange}
                        endCoords={endCoords}
                    />
                    
                    {/* Start Point Marker (Current Location) */}
                    {startCoords && (
                        <Marker position={[startCoords.lat, startCoords.lng]} icon={startIcon}>
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-green-600">🟢 Start Point</div>
                                    <div className="text-xs text-gray-600">Your Current Location</div>
                                    <div className="text-xs">
                                        {startCoords.lat.toFixed(4)}, {startCoords.lng.toFixed(4)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    
                    {/* End Point Marker */}
                    {endCoords && (
                        <Marker position={[endCoords.lat, endCoords.lng]} icon={endIcon}>
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-red-600">🔴 End Point</div>
                                    <div className="text-xs text-gray-600">Your Destination</div>
                                    <div className="text-xs">
                                        {endCoords.lat.toFixed(4)}, {endCoords.lng.toFixed(4)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* Distance Display */}
            {distance && (
                <div className="mt-4 text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-800">
                        📏 Distance: {distance.toFixed(2)} km
                    </div>
                    <div className="text-sm text-green-600">
                        Estimated time: {Math.ceil(distance * 10)} minutes
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <div className="font-semibold mb-2">How it works:</div>
                <ul className="list-disc list-inside space-y-1">
                    <li>🟢 Start point is automatically set to your current location</li>
                    <li>🔴 Click anywhere on the map to set your destination</li>
                    <li>📱 Make sure location services are enabled</li>
                    <li>🏃‍♀️ You'll be tracked in real-time during your run</li>
                </ul>
            </div>
        </div>
    );
}