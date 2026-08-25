import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Navigation, MapPin, Loader2, Info } from 'lucide-react';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  onChange: (lat: number, lng: number) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const customPinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        background: rgba(99, 102, 241, 0.35);
        border-radius: 50%;
        animation: pulsePin 2s infinite ease-in-out;
      "></div>
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        background: #4F46E5;
        border: 2px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  radiusMeters,
  onChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const validLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 28.6139;
  const validLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : 77.209;
  const validRadius = typeof radiusMeters === 'number' && !isNaN(radiusMeters) ? radiusMeters : 150;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [validLat, validLng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([validLat, validLng], {
      icon: customPinIcon,
      draggable: true,
    }).addTo(map);

    const circle = L.circle([validLat, validLng], {
      radius: validRadius,
      color: '#6366F1',
      fillColor: '#6366F1',
      fillOpacity: 0.22,
      weight: 2,
      dashArray: '6, 6',
    }).addTo(map);

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onChange(parseFloat(position.lat.toFixed(6)), parseFloat(position.lng.toFixed(6)));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map elements when coordinates or radius change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;

    const newLatLng: [number, number] = [validLat, validLng];

    markerRef.current.setLatLng(newLatLng);
    circleRef.current.setLatLng(newLatLng);
    circleRef.current.setRadius(validRadius);

    const currentCenter = mapInstanceRef.current.getCenter();
    const distance = mapInstanceRef.current.distance(currentCenter, L.latLng(validLat, validLng));

    // Pan map if marker moved significantly
    if (distance > 30) {
      mapInstanceRef.current.panTo(newLatLng, { animate: true });
    }
  }, [validLat, validLng, validRadius]);

  // Handle Search using Nominatim OpenStreetMap API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setGeoError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data.slice(0, 5));
      } else {
        setGeoError('No locations found for this query.');
      }
    } catch (err) {
      setGeoError('Location search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const newLat = parseFloat(parseFloat(result.lat).toFixed(6));
    const newLng = parseFloat(parseFloat(result.lon).toFixed(6));
    onChange(newLat, newLng);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  // Device GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = parseFloat(pos.coords.latitude.toFixed(6));
        const newLng = parseFloat(pos.coords.longitude.toFixed(6));
        onChange(newLat, newLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17);
        }
        setIsLocating(false);
      },
      (err) => {
        setGeoError(`Unable to get current location: ${err.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
      {/* Inject Keyframe Animation for Pulse Pin */}
      <style>{`
        @keyframes pulsePin {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        .leaflet-container {
          border-radius: 12px;
          z-index: 1;
        }
      `}</style>

      {/* Top Bar Controls: Search & Locate Me */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <form
          onSubmit={handleSearch}
          style={{ flex: 1, display: 'flex', gap: '8px', minWidth: '260px', position: 'relative' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Search address or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <button type="submit" disabled={isSearching} className="btn btn-secondary" style={{ padding: '0 16px' }}>
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                backgroundColor: 'var(--bg-sidebar)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {searchResults.map((item) => (
                <div
                  key={item.place_id}
                  onClick={() => handleSelectSearchResult(item)}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <MapPin size={14} color="#818CF8" style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.display_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px' }}
        >
          {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} color="#34D399" />}
          <span>Use Current Location</span>
        </button>
      </div>

      {geoError && (
        <div
          style={{
            fontSize: '0.8rem',
            color: '#F87171',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          ⚠️ {geoError}
        </div>
      )}

      {/* Leaflet Map Box */}
      <div
        style={{
          width: '100%',
          height: '340px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Instruction Banner */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 999,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} color="#818CF8" />
            <span><strong>Click map</strong> or <strong>drag marker</strong> to set school center location.</span>
          </span>
          <span style={{ color: '#818CF8', fontWeight: 600 }}>Geofence: {validRadius}m</span>
        </div>
      </div>
    </div>
  );
};
