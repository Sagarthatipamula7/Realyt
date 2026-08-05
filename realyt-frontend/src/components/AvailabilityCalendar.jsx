import { useEffect, useMemo, useState } from 'react';
import api from '../api/auth.js';

function buildDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const days = [];
  const last = new Date(year, month + 1, 0);
  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  return days;
}

export default function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  useEffect(() => {
    const from = new Date(year, month, 1).toISOString().slice(0, 10);
    const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    setLoading(true);
    api
      .get('/api/availability', { params: { from, to } })
      .then((response) => {
        const payload = response.data || [];
        const availabilityMap = payload.reduce((acc, item) => {
          acc[item.date] = item.openSlots;
          return acc;
        }, {});
        setAvailability(availabilityMap);
      })
      .catch(() => {
        setAvailability({});
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  return (
    <div className="glow-card" style={{ padding: '26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.4rem' }}>This month</h3>
          <p className="small-note">Open editor slots shown below.</p>
        </div>
        <div>{loading ? 'Loading...' : 'Updated'}</div>
      </div>

      <div className="card-grid" style={{ marginTop: '24px' }}>
        {days.map((date) => {
          const key = buildDateKey(date);
          const slots = availability[key] ?? 0;
          const isSelected = selectedDate === key;
          const isPast = date < today;

          return (
            <button
              key={key}
              type="button"
              disabled={isPast || slots === 0}
              onClick={() => setSelectedDate(key)}
              style={{
                borderRadius: '22px',
                background: isSelected ? 'rgba(246, 199, 97, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid rgba(246, 199, 97, 0.38)' : '1px solid rgba(255,255,255,0.12)',
                color: isPast ? 'rgba(255,255,255,0.38)' : 'inherit',
                padding: '18px',
                textAlign: 'left',
                minHeight: '120px',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '0.95rem', marginBottom: '6px' }}>
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{slots}</div>
              <div style={{ color: '#c8b68d', marginTop: '6px' }}>
                {slots > 0 ? 'slots open' : 'full'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
