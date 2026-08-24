import { useEffect, useRef } from 'react';

export default function DropdownMenu({ open, onClose, recentCities, onSelectCity, onRemoveCity, onClearHistory, unit, onToggleUnit }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (open && menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('.dropdown-wrapper')) {
        onClose();
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dropdown-menu" ref={menuRef}>
      <div className="dropdown-section">
        <div className="dropdown-label">Recent Cities</div>
        <div className="recent-cities-list">
          {recentCities.length === 0 ? (
            <div className="dropdown-empty">No recent searches</div>
          ) : (
            recentCities.map((city, i) => (
              <div key={i} className="recent-city-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <span className="city-name" onClick={() => { onSelectCity(city); onClose(); }}>
                  {city}
                </span>
                <button className="remove-city" title="Remove" onClick={(e) => { e.stopPropagation(); onRemoveCity(city); }}>
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="dropdown-divider"></div>
      <div className="dropdown-section">
        <div className="dropdown-label">Settings</div>
        <button className="dropdown-item" onClick={() => { onToggleUnit(); onClose(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          </svg>
          <span>Units: <strong>{unit === 'metric' ? '\u00B0C' : '\u00B0F'}</strong></span>
        </button>
        <button className="dropdown-item dropdown-item--danger" onClick={() => { onClearHistory(); onClose(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Clear History</span>
        </button>
      </div>
      <div className="dropdown-divider"></div>
      <div className="dropdown-section">
        <div className="dropdown-label">Keyboard Shortcuts</div>
        <div className="shortcut-hints">
          <div className="shortcut-row"><kbd>/</kbd> <span>Focus search</span></div>
          <div className="shortcut-row"><kbd>Esc</kbd> <span>Close menus</span></div>
          <div className="shortcut-row"><kbd>G</kbd> <span>Use location</span></div>
        </div>
      </div>
    </div>
  );
}
