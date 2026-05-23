import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const cleanAddress = (address) => {
  if (!address) return '';
  
  const parts = address.split(',');
  const filteredParts = parts.filter(part => {
    const trimmed = part.trim();
    if (!trimmed) return false;
    if (/^\d{6,}$/.test(trimmed)) return false;
    const provincePattern = /(省|自治区|特别行政区)$/;
    const countryPattern = /(中国|China)$/i;
    if (provincePattern.test(trimmed)) return false;
    if (countryPattern.test(trimmed)) return false;
    return true;
  });
  
  return filteredParts.reverse().join(', ');
};

export default function LocationPicker({ 
  value, 
  onChange, 
  placeholder = '点击地图选择位置',
  className = '' 
}) {
  const [position, setPosition] = useState(value ? { lat: value.lat, lng: value.lng } : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');

  const handleMapClick = async (latlng) => {
    const newPos = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPos);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18`
      );
      const result = await response.json();
      const rawAddress = result.display_name || '';
      const cleanedAddress = cleanAddress(rawAddress);
      setAddress(cleanedAddress);
      onChange(newPos, cleanedAddress);
    } catch (error) {
      console.error('获取地址失败:', error);
      onChange(newPos, '');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        const cleanedAddress = cleanAddress(display_name);
        setPosition(newPos);
        setAddress(cleanedAddress);
        onChange(newPos, cleanedAddress);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  const defaultCenter = position || { lat: 39.9042, lng: 116.4074 };
  const zoom = position ? 15 : 10;

  return (
    <div className={`location-picker ${className}`}>
      <div className="location-picker-search">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索地点..."
          className="location-search-input"
        />
        <button type="button" onClick={handleSearch} className="location-search-btn">
          搜索
        </button>
      </div>
      
      <div className="location-picker-map">
        <MapContainer
          center={defaultCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onSelect={handleMapClick} />
        </MapContainer>
      </div>
      
      {address && (
        <div className="location-picker-address">
          📍 {address}
        </div>
      )}
      
      {position && (
        <div className="location-picker-info">
          <span className="location-coords">
            坐标: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
        </div>
      )}
      
      {!position && (
        <div className="location-picker-hint">
          {placeholder}
        </div>
      )}
    </div>
  );
}
