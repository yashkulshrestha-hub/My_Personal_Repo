export function formatTime(unix, tz) {
  const d = new Date((unix + tz) * 1000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

export function formatDate(ts, tz) {
  const d = new Date((ts + tz) * 1000);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDay(ts) {
  const d = new Date(ts * 1000);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function unitSymbol(unit) {
  return unit === 'metric' ? '\u00B0C' : '\u00B0F';
}

export function speedUnit(unit) {
  return unit === 'metric' ? 'm/s' : 'mph';
}

export function getWindSpeed(speed, unit) {
  if (unit === 'metric') return speed.toFixed(1);
  return (speed * 2.237).toFixed(1);
}

export function getVisibilityKm(visibility, unit) {
  const visKm = (visibility / 1000).toFixed(1);
  if (unit === 'metric') return `${visKm} km`;
  return `${(visKm * 0.621371).toFixed(1)} mi`;
}

export function getBackgroundClass(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return 'bg-thunder';
  if (weatherId >= 300 && weatherId < 600) return 'bg-rain';
  if (weatherId >= 600 && weatherId < 700) return 'bg-snow';
  if (weatherId >= 700 && weatherId < 800) return 'bg-mist';
  if (weatherId === 800) return 'bg-clear';
  return 'bg-clouds';
}

export function groupForecastByDay(list) {
  const daily = [];
  const seen = new Set();
  for (const entry of list) {
    const day = entry.dt_txt.split(' ')[0];
    const hour = parseInt(entry.dt_txt.split(' ')[1]);
    if (!seen.has(day) && daily.length < 5) {
      seen.add(day);
      daily.push(entry);
    } else if (seen.has(day) && hour === 12) {
      const idx = daily.findIndex(e => e.dt_txt.split(' ')[0] === day);
      if (idx !== -1) daily[idx] = entry;
    }
  }
  return daily;
}
