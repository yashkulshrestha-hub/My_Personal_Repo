import { useState, useCallback } from 'react';

const STORAGE_KEY = 'weather_recent';
const MAX_RECENT = 8;

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecent(cities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}

export default function useRecentCities() {
  const [cities, setCities] = useState(loadRecent);

  const addCity = useCallback((city) => {
    setCities(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== city.toLowerCase());
      const updated = [city, ...filtered].slice(0, MAX_RECENT);
      saveRecent(updated);
      return updated;
    });
  }, []);

  const removeCity = useCallback((city) => {
    setCities(prev => {
      const updated = prev.filter(c => c.toLowerCase() !== city.toLowerCase());
      saveRecent(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCities([]);
  }, []);

  return { cities, addCity, removeCity, clearAll };
}
