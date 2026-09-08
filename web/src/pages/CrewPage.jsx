import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { fullName, initials, money, phoneView, ROLE_NAME, plural } from '../lib/format.js';

function PersonRow({ emp, can, onChange, onRates, children }) {
  const photo = api.fileUrl(emp.photo_path);
  const age = emp.birth_date
    ? Math.floor((Date.now() - new Date(emp.birth_date)) / 31557600000)
    : null;

  return (
    <div className="person">
      {photo ? <img className="avatar" src={photo} alt="" /> : <span className="avatar">{initials(emp)}</span>}
      <div style={{ minWidth: 0 }}>
        <div className="person__name">{fullName(emp)}</div>
        <div className="person__meta">
          {ROLE_NAME[emp.role]}
          {age ? ` · ${age} ${plural(age, 'год', 'года', 'лет')}` : ''}
          {' · ' + phoneView(emp.phone)}
        </div>
      </div>
      <div className="person__side">
        {children}
        {can.manageCrew && (
          <>
            <select
              value={emp.role}
              onChange={(e) => onChange(emp, { role: e.target.value })}
              style={{ minHeight: 44, border: '1px solid var(--line-2)', borderRadius: 8, padding: '0 8px', fontSize: 14 }}
            >
              <option value="picker">Комплектовщик</option>
              <option value="senior">Старший</option>
              <option value="admin">Руководитель</option>
            </select>
            <button className="btn btn--sm btn--ghost" onClick={() => onRates(emp)}>Ставка</button>
          </>
        )}
      </div>
    </div>
  );
}

// Личная ставка перебивает типовую по должности — например, у опытного комплектовщика.
function PersonalRates({ emp, onClose }) {
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState({ kind: 'day', amount: '' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get(`/api/employees/${emp.id}/rates`).then(setRates).catch(() => {});
  }, [emp.id]);

  useEffect(load, [load]);

  async function add(e) {
    e.preventDefault();
    try {
      await api.post(`/api/employees/${emp.id}/rates`, {
        kind: form.kind, amount: Number(form.amount),
      });
      setForm({ ...form, amount: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <div>
            <h2 style={{ fontSize: 20 }}>Личная ставка</h2>
            <div className="small muted">{fullName(emp)}</div>
          </div>
          <button className="sheet__close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="card card--flat">
          {!rates.length && <div className="small muted">Личных ставок нет — считаем по должности.</div>}
          {rates.map((r) => (
            <div className="person" key={r.id}>
              <div>
                <div className="person__name">{r.kind === 'day' ? 'Дневная' : 'Ночная'} · {money(r.amount)} ₽</div>
                <div className="person__meta">действует с {r.effective_from.slice(0, 10)}</div>
              </div>
              <div className="person__side">
                <button
                  className="btn btn--sm btn--ghost"
                  onClick={async () => { await api.del(`/api/employees/${emp.id}/rates/${r.id}`); load(); }}
                >
                  Убрать
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={add} className="row" style={{ alignItems: 'flex-end' }}>
          <label className="field">
            <span>Смена</span>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="day">Дневная</option>
              <option value="night">Ночная</option>
            </select>
          </label>
          <label className="field">
            <span>Ставка, ₽</span>
            <input inputMode="numeric" value={form.amount} required
              onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </label>
          <button className="btn btn--sm" style={{ flex: '0 0 auto', marginBottom: 12 }}>Задать</button>
        </form>
      </div>
    </div>
  );
}

export default function CrewPage() {
  const { can, me } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratesFor, setRatesFor] = useState(null);

  const load = useCallback(async () => {
    try {
      setList(await api.get('/api/employees'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Удаление стирает и расчёты, поэтому спрашиваем и подсказываем про блокировку.
  async function remove(emp) {
    const ok = confirm(
      `Удалить ${fullName(emp)} полностью?\n\n`
      + 'Вместе с ним удалятся все его смены, выработка, выплаты и штрафы. '
      + 'Отменить это будет нельзя.\n\n'
      + 'Если человек просто уволился — лучше «Заблокировать»: история расчётов сохранится.',
    );
    if (!ok) return;
    try {
      await api.del(`/api/employees/${emp.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function change(emp, patch) {
    try {
      await api.patch(`/api/employees/${emp.id}`, patch);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading">Загрузка…</div>;

  const pending = list.filter((e) => e.status === 'pending');
  const active = list.filter((e) => e.status === 'active');
  const blocked = list.filter((e) => e.status === 'blocked');

  return (
    <>
      <h1 className="page-title">Люди</h1>
      <p className="page-sub">Подтверждайте новых и назначайте должность — от неё зависит ставка.</p>

      {error && <div className="alert">{error}</div>}

      {pending.length > 0 && (
        <>
          <div className="section">Новые заявки · {pending.length}</div>
          {pending.map((emp) => (
            <div className="card" key={emp.id}>
              <PersonRow emp={emp} can={can} onChange={change} onRates={setRatesFor} />
              {can.manageCrew && (
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn btn--accent btn--sm"
                    onClick={() => change(emp, { status: 'active' })}>
                    Принять
                  </button>
                  <button className="btn btn--ghost btn--sm"
                    onClick={() => change(emp, { status: 'blocked' })}>
                    Отказать
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div className="section">В штате · {active.length}</div>
      <div className="card">
        {!active.length && <div className="small muted">Пока никого.</div>}
        {active.map((emp) => (
          <PersonRow key={emp.id} emp={emp} can={can} onChange={change} onRates={setRatesFor}>
            {can.manageCrew && emp.id !== me.id && (
              <>
                <button
                  className="btn btn--sm btn--ghost"
                  onClick={() => change(emp, { status: 'blocked' })}
                >
                  Заблокировать
                </button>
                <button className="btn btn--sm btn--danger" onClick={() => remove(emp)}>
                  Удалить
                </button>
              </>
            )}
          </PersonRow>
        ))}
      </div>

      {blocked.length > 0 && (
        <>
          <div className="section">Не работают · {blocked.length}</div>
          <div className="card card--flat">
            {blocked.map((emp) => (
              <PersonRow key={emp.id} emp={emp} can={can} onChange={change} onRates={setRatesFor}>
                {can.manageCrew && (
                  <>
                    <button className="btn btn--sm btn--ghost"
                      onClick={() => change(emp, { status: 'active' })}>
                      Вернуть в штат
                    </button>
                    <button className="btn btn--sm btn--danger" onClick={() => remove(emp)}>
                      Удалить
                    </button>
                  </>
                )}
              </PersonRow>
            ))}
          </div>
        </>
      )}

      {ratesFor && <PersonalRates emp={ratesFor} onClose={() => setRatesFor(null)} />}
    </>
  );
}
