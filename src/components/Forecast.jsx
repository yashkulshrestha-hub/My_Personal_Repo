import ForecastCard from './ForecastCard';
import { groupForecastByDay } from '../utils/helpers';

export default function Forecast({ data, unit }) {
  if (!data || data.length === 0) return null;

  const daily = groupForecastByDay(data);

  return (
    <section className="forecast-section">
      <h3>5-Day Forecast</h3>
      <div className="forecast-cards">
        {daily.map((entry, i) => (
          <ForecastCard key={i} entry={entry} unit={unit} />
        ))}
      </div>
    </section>
  );
}
