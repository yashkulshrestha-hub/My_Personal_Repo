import { useState } from 'react';
import { formatDay, unitSymbol, speedUnit, getWindSpeed } from '../utils/helpers';

export default function ForecastCard({ entry, unit }) {
  const [expanded, setExpanded] = useState(false);

  const wind = `${getWindSpeed(entry.wind.speed, unit)} ${speedUnit(unit)}`;
  const feelsLike = Math.round(entry.main.feels_like);

  return (
    <div className={`forecast-card${expanded ? ' expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="day">{formatDay(entry.dt)}</div>
      <img
        src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`}
        alt={entry.weather[0].description}
        loading="lazy"
      />
      <div className="fc-temp">{Math.round(entry.main.temp)}{unitSymbol(unit)}</div>
      <div className="fc-desc">{entry.weather[0].description}</div>
      <div className="fc-details">
        <div className="fc-details-row"><span>Feels like</span><span>{feelsLike}{unitSymbol(unit)}</span></div>
        <div className="fc-details-row"><span>Humidity</span><span>{entry.main.humidity}%</span></div>
        <div className="fc-details-row"><span>Wind</span><span>{wind}</span></div>
      </div>
    </div>
  );
}
