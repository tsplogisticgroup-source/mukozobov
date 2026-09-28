import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { fullName, initials, money, phoneView, ROLE_NAME, WORK_NAME, plural } from '../lib/format.js';

function PersonRow({ emp, can, me, onChange, onRates, children }) {
  const photo = api.fileUrl(emp.photo_path);
  const age = emp.birth_date
    ? Math.floor((Date.now() - new Date(emp.birth_date)) / 31557600000)
    : null;
  // Собственника трогает только собственник; себя понижать нельзя.
  const locked = !can.manageCrew || (emp.role === 'owner' && !can.isOwner) || emp.id === me.id;

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
        {can.manageCrew && !locked && (
          <select
            value={emp.role}
            onChange={(e) => onChange(emp, { role: e.target.value })}
            style={{ minHeight: 44, border: '1px solid var(--line-2)', borderRadius: 8, padding: '0 8px', fontSize: 14 }}
          >
            <option value="picker">Комплектовщик</option>
            <option value="senior">Старший смены</option>
            <option value="admin">Руководитель склада</option>
            {can.isOwner && <option value="owner">Собственник</option>}
          </select>
        )}
        {can.seeMoney && (
          <button className="btn btn--sm btn--ghost" onClick={() => onRates(emp)}>Ставка</button>
        )}
      </div>
    </div>
  );
}

// Личная ставка за час перебивает ставку по должности.
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
      await api.post(`/api/employees/${emp.id}/rates`, { kind: form.kind, amount: Number(form.amount) });
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
            <h2 style={{ fontSize: 20 }}>Личная ставка за час</h2>
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
                <div className="person__name">{r.kind === 'day' ? 'Дневная' : 'Ночная'} · {money(r.amount)} ₽/ч</div>
                <div className="person__meta">действует с {r.effective_from.slice(0, 10)}</div>
              </div>
              <div className="person__side">
                <button className="btn btn--sm btn--ghost"
                  onClick={async () => { await api.del(`/api/employees/${emp.id}/rates/${r.id}`); load(); }}>
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
            <span>₽ за час</span>
            <input inputMode="numeric" value={form.amount} required
              onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </label>
          <button className="btn btn--sm" style={{ flex: '0 0 auto', marginBottom: 12 }}>Задать</button>
        </form>
      </div>
    </div>
  );
}

// Справочник водителей для отгрузок.
function Drivers({ can, setError }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', vehicle: '' });

  const load = useCallback(() => {
    api.get('/api/drivers?all=1').then(setList).catch((e) => setError(e.message));
  }, [setError]);

  useEffect(load, [load]);

  async function add(e) {
    e.preventDefault();
    try {
      await api.post('/api/drivers', form);
      setForm({ name: '', phone: '', vehicle: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const active = list.filter((d) => d.active);
  const archived = list.filter((d) => !d.active);

  return (
    <div className="card">
      {!list.length && <div className="small muted">Водителей пока нет.</div>}
      {active.map((d) => (
        <div className="person" key={d.id}>
          <div>
            <div className="person__name">{d.name}</div>
            <div className="person__meta">
              {[d.vehicle, d.phone ? phoneView(d.phone) : null].filter(Boolean).join(' · ') || 'без данных'}
            </div>
          </div>
          {can.manageCrew && (
            <div className="person__side">
              <button className="btn btn--sm btn--ghost"
                onClick={async () => { await api.del(`/api/drivers/${d.id}`); load(); }}>
                Убрать
              </button>
            </div>
          )}
        </div>
      ))}
      {archived.map((d) => (
        <div className="person" key={d.id} style={{ opacity: 0.55 }}>
          <div>
            <div className="person__name">{d.name}</div>
            <div className="person__meta">в архиве — по нему есть отгрузки</div>
          </div>
          {can.manageCrew && (
            <div className="person__side">
              <button className="btn btn--sm btn--ghost"
                onClick={async () => { await api.patch(`/api/drivers/${d.id}`, { active: true }); load(); }}>
                Вернуть
              </button>
            </div>
          )}
        </div>
      ))}

      {can.manageCrew && (
        <form onSubmit={add} className="row" style={{ alignItems: 'flex-end', marginTop: 12 }}>
          <label className="field">
            <span>Имя</span>
            <input required value={form.name} placeholder="Сергей"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            <span>Машина</span>
            <input value={form.vehicle} placeholder="Газель А123БВ"
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })} />
          </label>
          <label className="field">
            <span>Телефон</span>
            <input inputMode="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <button className="btn btn--sm" style={{ flex: '0 0 auto', marginBottom: 14 }}>Добавить</button>
        </form>
      )}
    </div>
  );
}

// Единицы учёта для плана и выработки.
function Units({ can, setError }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ work_type: 'FBO', unit: '' });

  const load = useCallback(() => {
    api.get('/api/units').then(setList).catch((e) => setError(e.message));
  }, [setError]);

  useEffect(load, [load]);

  async function add(e) {
    e.preventDefault();
    try {
      await api.post('/api/units', form);
      setForm({ ...form, unit: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      {list.map((u) => (
        <div className="person" key={u.id}>
          <div className="person__name">{WORK_NAME[u.work_type]} · {u.unit}</div>
          {can.manageCrew && (
            <div className="person__side">
              <button className="btn btn--sm btn--ghost"
                onClick={async () => { await api.del(`/api/units/${u.id}`); load(); }}>
                Убрать
              </button>
            </div>
          )}
        </div>
      ))}
      {can.manageCrew && (
        <form onSubmit={add} className="row" style={{ alignItems: 'flex-end', marginTop: 12 }}>
          <label className="field">
            <span>Тип</span>
            <select value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}>
              <option value="FBO">ФБО</option>
              <option value="FBS">ФБС</option>
            </select>
          </label>
          <label className="field">
            <span>Единица</span>
            <input required value={form.unit} placeholder="паллета"
              onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </label>
          <button className="btn btn--sm" style={{ flex: '0 0 auto', marginBottom: 14 }}>Добавить</button>
        </form>
      )}
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

  async function remove(emp) {
    const ok = confirm(
      `Удалить ${fullName(emp)} полностью?\n\n`
      + 'Вместе с ним удалятся все его смены, часы, выплаты и штрафы. Отменить это будет нельзя.\n\n'
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
  const canTouch = (emp) => can.manageCrew && emp.id !== me.id && (emp.role !== 'owner' || can.isOwner);

  return (
    <>
      <h1 className="page-title">Люди</h1>
      <p className="page-sub">
        {can.manageCrew
          ? 'Подтверждайте новых и назначайте должность. Здесь же водители и единицы учёта.'
          : 'Кто работает на складе и как с ним связаться.'}
      </p>

      {error && <div className="alert">{error}</div>}

      {pending.length > 0 && (
        <>
          <div className="section">Новые заявки · {pending.length}</div>
          {pending.map((emp) => (
            <div className="card" key={emp.id}>
              <PersonRow emp={emp} can={can} me={me} onChange={change} onRates={setRatesFor} />
              {can.manageCrew && (
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn btn--accent btn--sm" onClick={() => change(emp, { status: 'active' })}>
                    Принять
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => change(emp, { status: 'blocked' })}>
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
          <PersonRow key={emp.id} emp={emp} can={can} me={me} onChange={change} onRates={setRatesFor}>
            {canTouch(emp) && (
              <>
                <button className="btn btn--sm btn--ghost" onClick={() => change(emp, { status: 'blocked' })}>
                  Заблокировать
                </button>
                <button className="btn btn--sm btn--danger" onClick={() => remove(emp)}>Удалить</button>
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
              <PersonRow key={emp.id} emp={emp} can={can} me={me} onChange={change} onRates={setRatesFor}>
                {canTouch(emp) && (
                  <>
                    <button className="btn btn--sm btn--ghost" onClick={() => change(emp, { status: 'active' })}>
                      Вернуть в штат
                    </button>
                    <button className="btn btn--sm btn--danger" onClick={() => remove(emp)}>Удалить</button>
                  </>
                )}
              </PersonRow>
            ))}
          </div>
        </>
      )}

      <div className="section">Водители</div>
      <Drivers can={can} setError={setError} />

      {can.manageCrew && (
        <>
          <div className="section">Единицы учёта в плане и выработке</div>
          <Units can={can} setError={setError} />
        </>
      )}

      {ratesFor && <PersonalRates emp={ratesFor} onClose={() => setRatesFor(null)} />}
    </>
  );
}
