import { useState, useEffect, useRef } from 'react';
import './LocationPicker.css';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '9743956dbf6ba4884ce3fe44805f3259';

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
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [position, setPosition] = useState(value ? { lat: value.lat, lng: value.lng } : null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!window.AMap) {
      console.error('❌ 高德地图 API 未加载');
      return;
    }

    console.log('✅ 高德地图 API 已加载');

    const defaultCenter = position || { lat: 39.9042, lng: 116.4074 };
    
    const map = new window.AMap.Map(mapRef.current, {
      zoom: position ? 15 : 10,
      center: [defaultCenter.lng, defaultCenter.lat],
      viewMode: '2D',
    });

    mapInstanceRef.current = map;
    console.log('🗺️ 地图初始化完成');

    window.AMap.plugin(['AMap.Geocoder', 'AMap.PlaceSearch'], () => {
      console.log('✅ 插件加载完成');
      setIsMapReady(true);
      
      if (!position && !value) {
        getCurrentLocation();
      }
    });

    map.on('click', (e) => {
      const { lng, lat } = e.lnglat;
      console.log(`🖱️ 点击地图: ${lat}, ${lng}`);
      handleLocationSelect(lat, lng);
    });

    if (position) {
      addMarker([position.lng, position.lat]);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isMapReady && value) {
      const newPos = { lat: value.lat, lng: value.lng };
      setPosition(newPos);
      const map = mapInstanceRef.current;
      if (map) {
        map.setCenter([newPos.lng, newPos.lat]);
        map.setZoom(15);
        addMarker([newPos.lng, newPos.lat]);
      }
      
      const geocoder = new window.AMap.Geocoder();
      geocoder.getAddress([newPos.lng, newPos.lat], (status, result) => {
        console.log('🔍 逆地理编码状态:', status);
        console.log('📍 逆地理编码结果:', result);
        
        if (status === 'complete' && result.info === 'OK') {
          const cleanedAddress = cleanAddress(result.regeocode.formattedAddress);
          console.log('✅ 获取到地址:', cleanedAddress);
          setAddress(cleanedAddress);
        } else {
          console.error('❌ 获取地址失败:', status, result.info);
        }
      });
    }
  }, [value, isMapReady]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn('⚠️ 浏览器不支持地理定位');
      return;
    }

    setIsLocating(true);
    console.log('📍 正在获取当前位置...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log(`📍 获取到GPS位置: ${latitude}, ${longitude}`);
        
        const map = mapInstanceRef.current;
        if (map) {
          map.setCenter([longitude, latitude]);
          map.setZoom(15);
          addMarker([longitude, latitude]);
        }
        
        setPosition({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error('❌ 获取位置失败:', err);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.AMap.Geocoder();
    geocoder.getAddress([lng, lat], (status, result) => {
      console.log('🔍 逆地理编码状态:', status);
      console.log('📍 逆地理编码结果:', result);
      
      if (status === 'complete' && result.info === 'OK') {
        const cleanedAddress = cleanAddress(result.regeocode.formattedAddress);
        console.log('✅ 获取到地址:', cleanedAddress);
        setAddress(cleanedAddress);
        onChange({ lat, lng }, cleanedAddress);
      } else {
        console.error('❌ 获取地址失败:', status, result.info);
        onChange({ lat, lng }, '');
      }
    });
  };

  const addMarker = (pos) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.AMap.Marker({
      position: pos,
      map: map,
    });
  };

  const handleLocationSelect = (lat, lng) => {
    const newPos = { lat, lng };
    setPosition(newPos);
    addMarker([lng, lat]);

    const map = mapInstanceRef.current;
    if (map) {
      map.setCenter([lng, lat]);
    }

    reverseGeocode(lat, lng);
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !window.AMap) return;
    
    const placeSearch = new window.AMap.PlaceSearch({
      city: '全国',
      citylimit: false,
    });

    placeSearch.search(searchQuery, (status, result) => {
      console.log('🔍 搜索状态:', status);
      console.log('📍 搜索结果:', result);
      
      if (status === 'complete' && result.info === 'OK' && result.poiList.pois.length > 0) {
        const poi = result.poiList.pois[0];
        const lng = poi.location.lng;
        const lat = poi.location.lat;
        const cleanedAddress = cleanAddress(poi.address || poi.name);
        
        setPosition({ lat, lng });
        setAddress(cleanedAddress || poi.name);
        
        const map = mapInstanceRef.current;
        if (map) {
          map.setCenter([lng, lat]);
          map.setZoom(15);
          addMarker([lng, lat]);
        }
        
        onChange({ lat, lng }, cleanedAddress || poi.name);
        setSearchQuery('');
      } else {
        console.error('❌ 搜索失败:', status, result.info);
      }
    });
  };

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
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>
      
      {isLocating && (
        <div className="location-picker-hint">
          📍 正在获取当前位置...
        </div>
      )}
      
      {address && !isLocating && (
        <div className="location-picker-address">
          📍 {address}
        </div>
      )}
      
      {!position && !isLocating && (
        <div className="location-picker-hint">
          {placeholder}
        </div>
      )}
    </div>
  );
}
