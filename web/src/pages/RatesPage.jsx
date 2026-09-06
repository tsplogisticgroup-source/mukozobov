import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { money, todayISO, ROLE_NAME, KIND_NAME } from '../lib/format.js';

const ROLES = ['picker', 'senior', 'admin'];
const KINDS = ['day', 'night'];

export default function RatesPage() {
  const [shiftRates, setShiftRates] = useState([]);
  const [piece, setPiece] = useState([]);
  const [draft, setDraft] = useState({});
  const [from, setFrom] = useState(todayISO());
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [newPiece, setNewPiece] = useState({ work_type: 'FBS', unit: '', amount: '' });

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([api.get('/api/rates/shift'), api.get('/api/rates/piece')]);
    setShiftRates(s);
    setPiece(p);
    const d = {};
    s.forEach((r) => { d[`${r.role}-${r.kind}`] = r.amount; });
    p.forEach((r) => { d[`p-${r.id}`] = r.amount; });
    setDraft(d);
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = (role, kind) =>
    shiftRates.find((r) => r.role === role && r.kind === kind)?.amount ?? 0;

  async function saveShiftRates() {
    setError('');
    setMsg('');
    try {
      const changed = [];
      for (const role of ROLES) {
        for (const kind of KINDS) {
          const key = `${role}-${kind}`;
          const val = Number(draft[key]);
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

  async function savePiece(rate) {
    setError('');
    setMsg('');
    try {
      await api.post('/api/rates/piece', {
        work_type: rate.work_type,
        unit: rate.unit,
        amount: Number(draft[`p-${rate.id}`]),
        effective_from: from,
      });
      await load();
      setMsg('Расценка сохранена.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function addPiece(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/rates/piece', {
        work_type: newPiece.work_type,
        unit: newPiece.unit.trim(),
        amount: Number(newPiece.amount || 0),
        effective_from: from,
      });
      setNewPiece({ work_type: 'FBS', unit: '', amount: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="col-narrow">
      <h1 className="page-title">Ставки</h1>
      <p className="page-sub">
        Ставка за смену плюс сдельная доплата за выработку. Прошлые месяцы не пересчитываются —
        новая цена действует с выбранной даты.
      </p>

      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert alert--ok">{msg}</div>}

      <label className="field">
        <span>Новые ставки действуют с</span>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </label>

      <div className="section">За смену, ₽</div>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr><th>Должность</th><th className="n">День</th><th className="n">Ночь</th></tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role}>
                <td>{ROLE_NAME[role]}</td>
                {KINDS.map((kind) => (
                  <td className="n" key={kind}>
                    <input
                      inputMode="numeric"
                      value={draft[`${role}-${kind}`] ?? ''}
                      onChange={(e) => setDraft({ ...draft, [`${role}-${kind}`]: e.target.value })}
                      style={{
                        width: 90, minHeight: 42, textAlign: 'right',
                        border: '1px solid var(--line-2)', borderRadius: 8, padding: '0 8px',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn--accent btn--wide" style={{ marginTop: 12 }} onClick={saveShiftRates}>
          Сохранить ставки
        </button>
      </div>

      <div className="section">Сдельно, ₽ за единицу</div>
      <div className="card">
        <div className="small muted" style={{ marginBottom: 10 }}>
          0 — доплаты нет, платим только ставку за смену.
        </div>
        {piece.map((r) => (
          <div className="person" key={r.id}>
            <div>
              <div className="person__name">{r.work_type === 'FBO' ? 'ФБО' : 'ФБС'} · {r.unit}</div>
              <div className="person__meta">сейчас {money(r.amount)} ₽</div>
            </div>
            <div className="person__side">
              <input
                inputMode="decimal"
                value={draft[`p-${r.id}`] ?? ''}
                onChange={(e) => setDraft({ ...draft, [`p-${r.id}`]: e.target.value })}
                style={{ width: 80, minHeight: 40, textAlign: 'right', border: '1px solid var(--line-2)', borderRadius: 8, padding: '0 8px' }}
              />
              <button className="btn btn--sm" onClick={() => savePiece(r)}>OK</button>
            </div>
          </div>
        ))}

        <form onSubmit={addPiece} className="row" style={{ alignItems: 'flex-end', marginTop: 12 }}>
          <label className="field">
            <span>Тип</span>
            <select value={newPiece.work_type}
              onChange={(e) => setNewPiece({ ...newPiece, work_type: e.target.value })}>
              <option value="FBO">ФБО</option>
              <option value="FBS">ФБС</option>
            </select>
          </label>
          <label className="field">
            <span>Единица</span>
            <input value={newPiece.unit} required placeholder="короб"
              onChange={(e) => setNewPiece({ ...newPiece, unit: e.target.value })} />
          </label>
          <label className="field">
            <span>₽</span>
            <input inputMode="decimal" value={newPiece.amount}
              onChange={(e) => setNewPiece({ ...newPiece, amount: e.target.value })} />
          </label>
          <button className="btn btn--sm" style={{ flex: '0 0 auto', marginBottom: 12 }}>Добавить</button>
        </form>
      </div>

      <div className="card card--flat">
        <div className="small muted">
          Как считается смена: <b>ставка по должности</b> (или личная, если задана в разделе «Люди»)
          <b> + сдельная доплата</b> = сумма выработки × расценка.
        </div>
      </div>
    </div>
  );
}
