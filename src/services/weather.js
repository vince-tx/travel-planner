import areaData from 'china-area-data/data.json';

const AMAP_KEY = 'b76f1022a7ee4da15ade3863fb3bd341';

const weatherCache = new Map();
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000;

export function getCityCodeFromDestination(destination) {
  if (!destination) return null;
  
  const parts = destination.split('/');
  const provinces = areaData['86'];
  
  if (parts.length >= 2) {
    const provinceName = parts[0];
    const cityName = parts[1];
    
    const provinceCode = Object.keys(provinces).find(key => provinces[key] === provinceName);
    if (!provinceCode) return null;
    
    const cities = areaData[provinceCode] || {};
    const cityCode = Object.keys(cities).find(key => cities[key] === cityName);
    
    return cityCode || provinceCode;
  } else if (parts.length === 1) {
    const provinceName = parts[0];
    const provinceCode = Object.keys(provinces).find(key => provinces[key] === provinceName);
    return provinceCode || null;
  }
  
  return null;
}

export async function fetchWeather(cityCode) {
  if (!cityCode) return null;
  
  const now = Date.now();
  if (now - cacheTime < CACHE_DURATION && weatherCache.has(cityCode)) {
    return weatherCache.get(cityCode);
  }

  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${cityCode}&key=${AMAP_KEY}`
    );
    const data = await response.json();
    
    if (data.status === '1' && data.lives && data.lives.length > 0) {
      const weather = {
        city: data.lives[0].city,
        temperature: data.lives[0].temperature,
        weather: data.lives[0].weather,
        windDirection: data.lives[0].winddirection,
        windPower: data.lives[0].windpower,
        humidity: data.lives[0].humidity,
        reportTime: data.lives[0].reporttime
      };
      
      weatherCache.set(cityCode, weather);
      cacheTime = now;
      return weather;
    }
    return null;
  } catch (error) {
    console.error('获取天气失败:', error);
    return null;
  }
}

export function getWeatherIcon(weatherText) {
  if (!weatherText) return '🌤️';
  
  const text = weatherText.toLowerCase();
  if (text.includes('晴')) return '☀️';
  if (text.includes('云') && !text.includes('雨')) return '☁️';
  if (text.includes('雨')) return '🌧️';
  if (text.includes('雪')) return '❄️';
  if (text.includes('雷')) return '⛈️';
  if (text.includes('雾')) return '🌫️';
  return '🌤️';
}