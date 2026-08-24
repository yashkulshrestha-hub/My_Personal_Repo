import { useState, useEffect, useCallback, useRef } from 'react';
import useWeather from './hooks/useWeather';
import useRecentCities from './hooks/useRecentCities';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import Loading from './components/Loading';
import ErrorDisplay from './components/ErrorDisplay';
import InitialPrompt from './components/InitialPrompt';
import DropdownMenu from './components/DropdownMenu';
import Toast from './components/Toast';
import { getBackgroundClass, unitSymbol } from './utils/helpers';

export default function App() {
  const {
    currentData,
    forecastData,
    status,
    error,
    unit,
    lastQuery,
    fetchWeather,
    fetchWeatherByCoords,
    toggleUnit,
    retry,
  } = useWeather();

  const { cities, addCity, removeCity, clearAll } = useRecentCities();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const searchInputRef = useRef(null);

  // Background class
  const bgClass = currentData ? getBackgroundClass(currentData.weather[0].id) : '';

  // Apply background to body
  useEffect(() => {
    document.body.className = bgClass;
  }, [bgClass]);

  // Save recent city when weather loads successfully
  useEffect(() => {
    if (status === 'success' && currentData) {
      addCity(currentData.name);
    }
  }, [status, currentData, addCity]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          searchInputRef.current?.blur();
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setDropdownOpen(false);
      } else if (e.key === 'g' || e.key === 'G') {
        handleGeoClick();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGeoClick = useCallback(() => {
    if (!navigator.geolocation) {
      setToastMsg('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setToastMsg('Location access denied. Please search for a city instead.')
    );
  }, [fetchWeatherByCoords]); 

  const handleUnitToggle = useCallback(() => {
    toggleUnit();
    setToastMsg(`Switched to ${unit === 'metric' ? 'Fahrenheit' : 'Celsius'}`);
  }, [toggleUnit, unit]);

  const handleDropdownToggle = useCallback((e) => {
    e.stopPropagation();
    setDropdownOpen(prev => !prev);
  }, []);

  const handleSelectCity = useCallback((city) => {
    fetchWeather(city);
  }, [fetchWeather]);

  const handleClearHistory = useCallback(() => {
    clearAll();
    setToastMsg('Search history cleared');
  }, [clearAll]);

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);

  const showWeather = status === 'success' && currentData;
  const showError = status === 'error';
  const showLoading = status === 'loading';
  const showInitial = status === 'idle';

  return (
    <div className="app">
      <header>
        <h1>Weather Forecast</h1>
        <SearchBar onSearch={fetchWeather} />
        <div className="header-actions">
          <button className="icon-btn" title="Use my location" onClick={handleGeoClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
            </svg>
          </button>
          <button className="icon-btn unit-toggle" title="Toggle units" onClick={handleUnitToggle}>
            {unitSymbol(unit)}
          </button>
          <div className="dropdown-wrapper">
            <button className="icon-btn" title="Menu" onClick={handleDropdownToggle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <DropdownMenu
              open={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              recentCities={cities}
              onSelectCity={handleSelectCity}
              onRemoveCity={removeCity}
              onClearHistory={handleClearHistory}
              unit={unit}
              onToggleUnit={handleUnitToggle}
            />
          </div>
        </div>
      </header>

      <main>
        {showWeather && (
          <>
            <CurrentWeather data={currentData} unit={unit} />
            <Forecast data={forecastData} unit={unit} />
          </>
        )}
        {showLoading && <Loading />}
        {showError && <ErrorDisplay message={error} onRetry={handleRetry} />}
        {showInitial && <InitialPrompt />}
      </main>

      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg('')} />}
    </div>
  );
}
