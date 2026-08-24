export const API_KEY = '5a863728a33de464f47b2649572bbc2f';
export const BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export async function fetchCurrentWeather(query, unit) {
  const res = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(query)}&units=${unit}&appid=${API_KEY}`
  );
  if (!res.ok) {
    if (res.status === 404) throw new Error('City not found. Check the spelling and try again.');
    if (res.status === 401) throw new Error('Invalid API key.');
    throw new Error(`Server error (${res.status}). Please try again later.`);
  }
  return res.json();
}

export async function fetchForecast(query, unit) {
  const res = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&units=${unit}&appid=${API_KEY}`
  );
  if (!res.ok) throw new Error('Failed to load forecast data.');
  return res.json();
}

export async function fetchCurrentWeatherByCoords(lat, lon, unit) {
  const res = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key.');
    throw new Error(`Server error (${res.status}). Please try again later.`);
  }
  return res.json();
}

export async function fetchForecastByCoords(lat, lon, unit) {
  const res = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
  );
  if (!res.ok) throw new Error('Failed to load forecast data.');
  return res.json();
}

export async function fetchSuggestions(query) {
  if (query.length < 2) return [];
  const res = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`);
  if (!res.ok) return [];
  return res.json();
}
