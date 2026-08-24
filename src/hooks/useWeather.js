import { useState, useCallback, useRef } from 'react';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchCurrentWeatherByCoords,
  fetchForecastByCoords,
} from '../utils/api';

export default function useWeather() {
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric');
  const lastQuery = useRef('');

  const fetchWeather = useCallback(async (query) => {
    lastQuery.current = query;
    setStatus('loading');
    try {
      const [current, forecast] = await Promise.all([
        fetchCurrentWeather(query, unit),
        fetchForecast(query, unit),
      ]);
      setCurrentData(current);
      setForecastData(forecast.list);
      setStatus('success');
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Check your internet connection.');
      } else {
        setError(err.message);
      }
      setStatus('error');
    }
  }, [unit]);

  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    setStatus('loading');
    try {
      const [current, forecast] = await Promise.all([
        fetchCurrentWeatherByCoords(lat, lon, unit),
        fetchForecastByCoords(lat, lon, unit),
      ]);
      lastQuery.current = current.name;
      setCurrentData(current);
      setForecastData(forecast.list);
      setStatus('success');
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Check your internet connection.');
      } else {
        setError(err.message);
      }
      setStatus('error');
    }
  }, [unit]);

  const toggleUnit = useCallback(() => {
    setUnit(prev => (prev === 'metric' ? 'imperial' : 'metric'));
  }, []);

  const retry = useCallback(() => {
    if (lastQuery.current) fetchWeather(lastQuery.current);
  }, [fetchWeather]);

  return {
    currentData,
    forecastData,
    status,
    error,
    unit,
    lastQuery: lastQuery.current,
    fetchWeather,
    fetchWeatherByCoords,
    toggleUnit,
    retry,
  };
}
