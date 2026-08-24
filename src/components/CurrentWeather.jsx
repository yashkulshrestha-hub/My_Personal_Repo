import { formatDate, formatTime, unitSymbol, speedUnit, getWindSpeed, getVisibilityKm } from '../utils/helpers';

export default function CurrentWeather({ data, unit }) {
  if (!data) return null;

  const windSpeed = getWindSpeed(data.wind.speed, unit);
  const visibility = getVisibilityKm(data.visibility, unit);

  return (
    <section className="current-weather">
      <div className="location-info">
        <h2>{data.name}, {data.sys.country}</h2>
        <p>{formatDate(data.dt, data.timezone)}</p>
      </div>
      <div className="weather-main">
        <img
          src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`}
          alt={data.weather[0].description}
        />
        <div className="temp-block">
          <span id="temperature">{Math.round(data.main.temp)}{unitSymbol(unit)}</span>
          <span id="description">{data.weather[0].description}</span>
        </div>
      </div>
      <div className="details">
        <DetailItem icon={<ThermometerIcon />} label="Feels Like" value={`${Math.round(data.main.feels_like)}${unitSymbol(unit)}`} />
        <DetailItem icon={<DropletIcon />} label="Humidity" value={`${data.main.humidity}%`} />
        <DetailItem icon={<WindIcon />} label="Wind" value={`${windSpeed} ${speedUnit(unit)}`} />
        <DetailItem icon={<ClockIcon />} label="Pressure" value={`${data.main.pressure} hPa`} />
        <DetailItem icon={<EyeIcon />} label="Visibility" value={visibility} />
        <DetailItem icon={<SunriseIcon />} label="Sunrise" value={formatTime(data.sys.sunrise, data.timezone)} />
        <DetailItem icon={<SunsetIcon />} label="Sunset" value={formatTime(data.sys.sunset, data.timezone)} />
      </div>
    </section>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="detail-item">
      <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {icon}
      </svg>
      <span className="label">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ThermometerIcon() {
  return <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />;
}

function DropletIcon() {
  return <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />;
}

function WindIcon() {
  return <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />;
}

function ClockIcon() {
  return (
    <>
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </>
  );
}

function EyeIcon() {
  return (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </>
  );
}

function SunriseIcon() {
  return (
    <>
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="9" x2="12" y2="2" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
    </>
  );
}

function SunsetIcon() {
  return (
    <>
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
    </>
  );
}
