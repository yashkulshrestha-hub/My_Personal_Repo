// ─── Configuration ────────────────────────────────────────────────────────────
// Replace with your free key from https://openweathermap.org/api
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// ─── DOM References ───────────────────────────────────────────────────────────
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-btn');
const suggestionsEl = document.getElementById('suggestions');
const geoBtn = document.getElementById('geo-btn');
const unitBtn = document.getElementById('unit-btn');
const weatherContainer = document.getElementById('weather-container');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMsg = document.getElementById('error-message');
const initialPrompt = document.getElementById('initial-prompt');
const retryBtn = document.getElementById('retry-btn');
const apiNotice = document.getElementById('api-notice');

// ─── State ────────────────────────────────────────────────────────────────────
let lastQuery = '';
let unit = 'metric'; // metric | imperial
let debounceTimer = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function showLoading() {
  hide(weatherContainer);
  hide(errorEl);
  hide(initialPrompt);
  show(loadingEl);
}

function showError(msg) {
  hide(weatherContainer);
  hide(loadingEl);
  hide(initialPrompt);
  errorMsg.textContent = msg;
  show(errorEl);
}

function showWeather() {
  hide(loadingEl);
  hide(errorEl);
  hide(initialPrompt);
  show(weatherContainer);
}

function unitSymbol() { return unit === 'metric' ? '\u00B0C' : '\u00B0F'; }
function speedUnit() { return unit === 'metric' ? 'm/s' : 'mph'; }

function formatTime(unix, tz) {
  const d = new Date((unix + tz) * 1000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

function formatDate(ts, tz) {
  const d = new Date((ts + tz) * 1000);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

function formatDay(ts) {
  const d = new Date(ts * 1000);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

// ─── Dynamic Background ──────────────────────────────────────────────────────
function applyBackground(weatherId) {
  const body = document.body;
  body.classList.remove('bg-clear', 'bg-clouds', 'bg-rain', 'bg-snow', 'bg-thunder', 'bg-mist');

  if (weatherId >= 200 && weatherId < 300) body.classList.add('bg-thunder');
  else if (weatherId >= 300 && weatherId < 600) body.classList.add('bg-rain');
  else if (weatherId >= 600 && weatherId < 700) body.classList.add('bg-snow');
  else if (weatherId >= 700 && weatherId < 800) body.classList.add('bg-mist');
  else if (weatherId === 800) body.classList.add('bg-clear');
  else body.classList.add('bg-clouds');
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderCurrent(data) {
  document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('date').textContent = formatDate(data.dt, data.timezone);
  document.getElementById('weather-icon').src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  document.getElementById('weather-icon').alt = data.weather[0].description;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}${unitSymbol()}`;
  document.getElementById('description').textContent = data.weather[0].description;

  document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}${unitSymbol()}`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;

  const windSpeed = unit === 'metric'
    ? data.wind.speed.toFixed(1)
    : (data.wind.speed * 2.237).toFixed(1);
  document.getElementById('wind').textContent = `${windSpeed} ${speedUnit()}`;

  document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

  const visKm = (data.visibility / 1000).toFixed(1);
  document.getElementById('visibility').textContent = unit === 'metric' ? `${visKm} km` : `${(visKm * 0.621371).toFixed(1)} mi`;

  document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise, data.timezone);
  document.getElementById('sunset').textContent = formatTime(data.sys.sunset, data.timezone);

  applyBackground(data.weather[0].id);
}

function renderForecast(list) {
  const container = document.getElementById('forecast');
  container.innerHTML = '';

  // Group by day — pick noon entry or closest
  const daily = [];
  const seen = new Set();
  for (const entry of list) {
    const day = entry.dt_txt.split(' ')[0];
    const hour = parseInt(entry.dt_txt.split(' ')[1]);
    if (!seen.has(day) && daily.length < 5) {
      seen.add(day);
      daily.push(entry);
    } else if (seen.has(day) && hour === 12) {
      // Replace with noon entry for better accuracy
      const idx = daily.findIndex(e => e.dt_txt.split(' ')[0] === day);
      if (idx !== -1) daily[idx] = entry;
    }
  }

  for (const entry of daily) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="day">${formatDay(entry.dt)}</div>
      <img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png" alt="${entry.weather[0].description}" loading="lazy" />
      <div class="fc-temp">${Math.round(entry.main.temp)}${unitSymbol()}</div>
      <div class="fc-desc">${entry.weather[0].description}</div>
    `;
    container.appendChild(card);
  }
}

// ─── API Calls ────────────────────────────────────────────────────────────────
async function fetchWeather(query) {
  lastQuery = query;
  showLoading();

  try {
    const currentRes = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(query)}&units=${unit}&appid=${API_KEY}`
    );

    if (!currentRes.ok) {
      if (currentRes.status === 404) throw new Error('City not found. Check the spelling and try again.');
      if (currentRes.status === 401) throw new Error('Invalid API key. Replace YOUR_API_KEY in script.js with a valid OpenWeatherMap key.');
      throw new Error(`Server error (${currentRes.status}). Please try again later.`);
    }

    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&units=${unit}&appid=${API_KEY}`
    );

    if (!forecastRes.ok) throw new Error('Failed to load forecast data.');
    const forecastData = await forecastRes.json();

 <<<<<<< 17_08_2026_project
    if (count > 0) {
      valueEl.style.color = '#15c556';
    } else if (count < 0) {
      valueEl.style.color = '#e60c0c';
=======
    renderCurrent(currentData);
    renderForecast(forecastData.list);
    showWeather();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      showError('Network error. Check your internet connection.');
 >>>>>>> main
    } else {
      showError(err.message);
    }
  }
}

async function fetchWeatherByCoords(lat, lon) {
  showLoading();

  try {
    const currentRes = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
    );

    if (!currentRes.ok) {
      if (currentRes.status === 401) throw new Error('Invalid API key. Replace YOUR_API_KEY in script.js with a valid OpenWeatherMap key.');
      throw new Error(`Server error (${currentRes.status}). Please try again later.`);
    }

    const currentData = await currentRes.json();
    lastQuery = currentData.name;

    const forecastRes = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
    );

    if (!forecastRes.ok) throw new Error('Failed to load forecast data.');
    const forecastData = await forecastRes.json();

    renderCurrent(currentData);
    renderForecast(forecastData.list);
    showWeather();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      showError('Network error. Check your internet connection.');
    } else {
      showError(err.message);
    }
  }
}

async function fetchSuggestions(query) {
  if (query.length < 2) { hide(suggestionsEl); return; }

  try {
    const res = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`);
    if (!res.ok) return;
    const data = await res.json();

    if (data.length === 0) { hide(suggestionsEl); return; }

    suggestionsEl.innerHTML = '';
    for (const place of data) {
      const name = place.state
        ? `${place.name}, ${place.state}, ${place.country}`
        : `${place.name}, ${place.country}`;
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.textContent = name;
      div.addEventListener('click', () => {
        searchInput.value = name;
        hide(suggestionsEl);
        show(clearBtn);
        fetchWeather(name);
      });
      suggestionsEl.appendChild(div);
    }
    show(suggestionsEl);
  } catch {
    // Silently fail for suggestions
  }
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  hide(suggestionsEl);
  fetchWeather(query);
});

searchInput.addEventListener('input', () => {
  const val = searchInput.value.trim();
  val ? show(clearBtn) : hide(clearBtn);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchSuggestions(val), 300);
});

searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim().length >= 2) show(suggestionsEl);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) hide(suggestionsEl);
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  hide(clearBtn);
  hide(suggestionsEl);
  searchInput.focus();
});

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError('Location access denied. Please search for a city instead.')
  );
});

unitBtn.addEventListener('click', () => {
  unit = unit === 'metric' ? 'imperial' : 'metric';
  unitBtn.textContent = unit === 'metric' ? '\u00B0C' : '\u00B0F';
  if (lastQuery) fetchWeather(lastQuery);
});

retryBtn.addEventListener('click', () => {
  if (lastQuery) fetchWeather(lastQuery);
  else { hide(errorEl); show(initialPrompt); }
});

// ─── Init ─────────────────────────────────────────────────────────────────────
if (API_KEY === 'YOUR_API_KEY') {
  show(apiNotice);
}
