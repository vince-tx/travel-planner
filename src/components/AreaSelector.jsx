import { useState, useEffect } from 'react';
import areaData from 'china-area-data/data.json';
import './AreaSelector.css';

export default function AreaSelector({ value, onChange, className }) {
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');

  useEffect(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length >= 1) setProvince(parts[0]);
      if (parts.length >= 2) setCity(parts[1]);
      if (parts.length >= 3) setArea(parts[2]);
    } else {
      setProvince('');
      setCity('');
      setArea('');
    }
  }, [value]);

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value;
    setProvince(newProvince);
    
    if (newProvince) {
      const provinceCode = getProvinceCode(newProvince);
      const cities = provinceCode ? areaData[provinceCode] || {} : {};
      const cityNames = Object.values(cities);
      
      if (cityNames.length > 0) {
        const firstCity = cityNames[0];
        setCity(firstCity);
        
        const cityCode = Object.keys(cities).find(key => cities[key] === firstCity);
        const areas = cityCode ? areaData[cityCode] || {} : {};
        const areaNames = Object.values(areas);
        
        if (areaNames.length > 0) {
          const firstArea = areaNames[0];
          setArea(firstArea);
          onChange(`${newProvince}/${firstCity}/${firstArea}`);
        } else {
          setArea('');
          onChange(`${newProvince}/${firstCity}`);
        }
      } else {
        setCity('');
        setArea('');
        onChange(newProvince);
      }
    } else {
      setCity('');
      setArea('');
      onChange('');
    }
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCity(newCity);
    
    if (province && newCity) {
      const cities = getCities();
      const cityCode = Object.keys(cities).find(key => cities[key] === newCity);
      const areas = cityCode ? areaData[cityCode] || {} : {};
      const areaNames = Object.values(areas);
      
      if (areaNames.length > 0) {
        const firstArea = areaNames[0];
        setArea(firstArea);
        onChange(`${province}/${newCity}/${firstArea}`);
      } else {
        setArea('');
        onChange(`${province}/${newCity}`);
      }
    } else if (province) {
      setArea('');
      onChange(province);
    } else {
      setArea('');
      onChange('');
    }
  };

  const handleAreaChange = (e) => {
    const newArea = e.target.value;
    setArea(newArea);
    if (province && city && newArea) {
      onChange(`${province}/${city}/${newArea}`);
    } else if (province && city) {
      onChange(`${province}/${city}`);
    } else if (province) {
      onChange(province);
    } else {
      onChange('');
    }
  };

  const provinces = areaData['86'];
  
  const getProvinceCode = (name) => {
    return Object.keys(provinces).find(key => provinces[key] === name);
  };

  const getCities = () => {
    if (!province) return {};
    const provinceCode = getProvinceCode(province);
    return provinceCode ? areaData[provinceCode] || {} : {};
  };

  const getCityCode = (cityName) => {
    const cities = getCities();
    return Object.keys(cities).find(key => cities[key] === cityName);
  };

  const getAreas = () => {
    if (!city) return {};
    const cityCode = getCityCode(city);
    return cityCode ? areaData[cityCode] || {} : {};
  };

  const cities = getCities();
  const areas = getAreas();

  return (
    <div className={`area-selector ${className || ''}`}>
      <select
        value={province}
        onChange={handleProvinceChange}
        className="area-select"
      >
        <option value="">请选择省</option>
        {Object.entries(provinces).map(([code, name]) => (
          <option key={code} value={name}>{name}</option>
        ))}
      </select>
      <select
        value={city}
        onChange={handleCityChange}
        className="area-select"
        disabled={!province}
      >
        <option value="">请选择市</option>
        {Object.entries(cities).map(([code, name]) => (
          <option key={code} value={name}>{name}</option>
        ))}
      </select>
      <select
        value={area}
        onChange={handleAreaChange}
        className="area-select"
        disabled={!city}
      >
        <option value="">请选择区/县</option>
        {Object.entries(areas).map(([code, name]) => (
          <option key={code} value={name}>{name}</option>
        ))}
      </select>
    </div>
  );
}
