'use client'

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Search, Loader2 } from 'lucide-react';

// Custom emerald marker icon
const createCustomIcon = (color: string = '#059669') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const defaultIcon = createCustomIcon();

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ===== Types =====
interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  price?: number;
  area?: number;
  image?: string;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  draggable?: boolean;
  onPositionChange?: (lat: number, lng: number) => void;
  onLocationFound?: (city: string, address: string) => void;
  onMarkerClick?: (id: string) => void;
  className?: string;
  singleMarkerPosition?: [number, number];
}

// ===== Reverse Geocoding Helper =====
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.county || data.address.state || '';
      const address = data.display_name || '';
      return { city, address };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
  return { city: '', address: '' };
};

// ===== Draggable Marker for position picking =====
function DraggableMarker({
  position,
  onPositionChange,
  onLocationFound,
}: {
  position: [number, number];
  onPositionChange?: (lat: number, lng: number) => void;
  onLocationFound?: (city: string, address: string) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const [loading, setLoading] = useState(false);
  const [addressStr, setAddressStr] = useState<string>('');

  const updateLocation = async (lat: number, lng: number) => {
    setLoading(true);
    if (onPositionChange) onPositionChange(lat, lng);
    const { city, address } = await reverseGeocode(lat, lng);
    setAddressStr(address);
    if (onLocationFound) onLocationFound(city, address);
    setLoading(false);
  };

  useMapEvents({
    click(e) {
      updateLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  // On mount, if it's draggable, let's reverse geocode the initial position just once if we don't have address
  useEffect(() => {
    if (!addressStr) {
      updateLocation(position[0], position[1]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Marker
      draggable={true}
      position={position}
      ref={markerRef}
      icon={createCustomIcon('#ef4444')}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const pos = marker.getLatLng();
            updateLocation(pos.lat, pos.lng);
          }
        },
      }}
    >
      <Popup>
        <div className="p-2 text-center max-w-[200px]">
          <p className="font-bold text-slate-900 text-sm mb-1">Lokasi Lahan</p>
          {loading ? (
            <p className="text-xs text-emerald-600 animate-pulse">Mencari alamat...</p>
          ) : addressStr ? (
            <p className="text-xs text-slate-600 leading-tight">{addressStr}</p>
          ) : (
            <p className="text-xs text-slate-500">Geser pin atau klik peta</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

// ===== Map Resize handler =====
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

// ===== Map Search Control =====
function MapSearchControl({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] w-64 md:w-80">
      <div className="bg-white rounded-xl shadow-md flex overflow-hidden border border-slate-200">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Cari lokasi di peta..."
          className="w-full px-4 py-2.5 text-sm focus:outline-none text-slate-700"
        />
        <button onClick={search} className="bg-emerald-50 px-4 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button 
              key={i}
              className="w-full text-left px-4 py-3 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0 truncate text-slate-600"
              onClick={() => {
                const lat = parseFloat(r.lat);
                const lon = parseFloat(r.lon);
                onSelect(lat, lon);
                map.flyTo([lat, lon], 14);
                setResults([]);
                setQuery('');
              }}
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Main Component =====
export default function LeafletMap({
  center = [-6.9667, 110.4196],
  zoom = 12,
  markers = [],
  draggable = false,
  onPositionChange,
  onLocationFound,
  onMarkerClick,
  className = '',
  singleMarkerPosition,
}: LeafletMapProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`w-full h-full ${className}`}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />

      {/* Draggable mode — for picking location */}
      {draggable && singleMarkerPosition && (
        <>
          <MapSearchControl onSelect={(lat, lng) => onPositionChange && onPositionChange(lat, lng)} />
          <DraggableMarker
            position={singleMarkerPosition}
            onPositionChange={onPositionChange}
            onLocationFound={onLocationFound}
          />
        </>
      )}

      {/* Multiple markers — for browse/explore view */}
      {!draggable &&
        markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(m.id),
            }}
          >
            <Popup>
              <div className="p-3 min-w-[220px]">
                {m.image && (
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{m.title}</h3>
                {m.price && (
                  <p className="text-emerald-600 font-extrabold text-sm mt-1">
                    {formatPrice(m.price)}
                  </p>
                )}
                {m.area && (
                  <p className="text-slate-500 text-xs mt-1">{m.area} m²</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
