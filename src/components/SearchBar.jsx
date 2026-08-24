import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchSuggestions } from '../utils/api';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    setShowClear(val.length > 0);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (val.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await fetchSuggestions(val.trim());
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    onSearch(trimmed);
  };

  const handleSuggestionClick = (place) => {
    const name = place.state
      ? `${place.name}, ${place.state}, ${place.country}`
      : `${place.name}, ${place.country}`;
    setQuery(name);
    setShowClear(true);
    setShowSuggestions(false);
    onSearch(name);
  };

  const handleClear = () => {
    setQuery('');
    setShowClear(false);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query.trim().length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Search city..."
            autoComplete="off"
          />
          {showClear && (
            <button type="button" className="clear-btn" onClick={handleClear} aria-label="Clear search">
              &times;
            </button>
          )}
        </div>
        <button type="submit" id="search-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Search
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((place, i) => {
            const name = place.state
              ? `${place.name}, ${place.state}, ${place.country}`
              : `${place.name}, ${place.country}`;
            return (
              <div key={i} className="suggestion-item" onClick={() => handleSuggestionClick(place)}>
                {name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
