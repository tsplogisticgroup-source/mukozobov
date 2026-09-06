import { monthTitle } from '../lib/format.js';

export default function MonthNav({ month, onPrev, onNext, right }) {
  return (
    <div
      className="card card--flat"
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}
    >
      <button className="btn btn--ghost btn--sm" onClick={onPrev} aria-label="Предыдущий месяц">←</button>
      <div className="display" style={{ fontSize: 18, flex: 1, textAlign: 'center' }}>
        {monthTitle(month)}
      </div>
      <button className="btn btn--ghost btn--sm" onClick={onNext} aria-label="Следующий месяц">→</button>
      {right}
    </div>
  );
}
