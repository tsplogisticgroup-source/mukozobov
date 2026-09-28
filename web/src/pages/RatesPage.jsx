import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { money, todayISO, ROLE_NAME, KIND_NAME } from '../lib/format.js';

const ROLES = ['picker', 'senior', 'admin', 'owner'];
const KINDS = ['day', 'night'];

// Ставки за час по должности. Только собственник.
export default function RatesPage() {
  const [shiftRates, setShiftRates] = useState([]);
  const [draft, setDraft] = useState({});
  const [from, setFrom] = useState(todayISO());
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const s = await api.get('/api/rates/shift');
    setShiftRates(s);
    const d = {};
    s.forEach((r) => { d[`${r.role}-${r.kind}`] = r.amount; });
    setDraft(d);
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = (role, kind) =>
    shiftRates.find((r) => r.role === role && r.kind === kind)?.amount ?? 0;

  async function save() {
    setError('');
    setMsg('');
    try {
      const changed = [];
      for (const role of ROLES) {
        for (const kind of KINDS) {
          const val = Number(String(draft[`${role}-${kind}`] ?? '').replace(',', '.'));
          if (!Number.isNaN(val) && val !== Number(current(role, kind))) {
            changed.push({ role, kind, amount: val, effective_from: from });
          }
        }
      }
      if (!changed.length) return setMsg('Изменений нет.');
      for (const body of changed) await api.post('/api/rates/shift', body);
      await load();
      setMsg(`Сохранено. Новые ставки действуют с ${from}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="col-narrow">
      <h1 className="page-title">Ставки</h1>
      <p className="page-sub">
        Оплата почасовая: рублей за час по должности. Смена 12 часов по 500 ₽ — это 6 000 ₽.
        Прошлые месяцы не пересчитываются — новая ставка действует с выбранной даты.
      </p>

      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert alert--ok">{msg}</div>}

      <label className="field">
        <span>Новые ставки действуют с</span>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </label>

      <div className="section">₽ за час</div>
      <div className="card">
        {ROLES.map((role) => (
          <div className="rate-row" key={role}>
            <div className="rate-row__name">
              {ROLE_NAME[role]}
              {(role === 'owner' || role === 'admin') && (
                <div className="small muted" style={{ fontWeight: 400 }}>0 — если не считаем по часам</div>
              )}
            </div>
            {KINDS.map((kind) => (
              <label className="rate-row__field" key={kind}>
                <span>{KIND_NAME[kind]}</span>
                <input inputMode="decimal" value={draft[`${role}-${kind}`] ?? ''}
                  onChange={(e) => setDraft({ ...draft, [`${role}-${kind}`]: e.target.value })} />
              </label>
            ))}
          </div>
        ))}
        <button className="btn btn--accent btn--wide" style={{ marginTop: 14 }} onClick={save}>
          Сохранить ставки
        </button>
      </div>

      <div className="card card--flat">
        <div className="small muted">
          Как считается выход: <b>часы × ставка за час</b>. Часы каждому проставляет старший
          в окне смены (по умолчанию 12). Личная ставка, если задана в разделе «Люди»,
          перебивает ставку по должности. Пример: 12 ч × {money(current('picker', 'day'))} ₽
          = {money(12 * current('picker', 'day'))} ₽.
        </div>
      </div>
    </div>
  );
}
