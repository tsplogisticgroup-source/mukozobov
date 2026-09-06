import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import {
  dayNum, monthShort, weekday, longDate, money, qty, monthISO, KIND_NAME, STATUS_NAME, plural,
} from '../lib/format.js';

function OutputForm({ signupId, units, onSaved }) {
  const [form, setForm] = useState({ work_type: 'FBS', unit: '', quantity: '', comment: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const unitsFor = units.filter((u) => u.work_type === form.work_type);

  // Единица по умолчанию меняется вместе с типом работы
  useEffect(() => {
    if (unitsFor.length && !unitsFor.some((u) => u.unit === form.unit)) {
      setForm((f) => ({ ...f, unit: unitsFor[0].unit }));
    }
  }, [form.work_type, units]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/outputs', {
        signup_id: signupId,
        work_type: form.work_type,
        unit: form.unit,
        quantity: Number(String(form.quantity).replace(',', '.')),
        comment: form.comment,
      });
      setForm({ ...form, quantity: '', comment: '' });
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 10 }}>
      {error && <div className="alert">{error}</div>}
      <div className="row">
        <label className="field">
          <span>Тип работы</span>
          <select value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}>
            <option value="FBO">ФБО</option>
            <option value="FBS">ФБС</option>
          </select>
        </label>
        <label className="field">
          <span>Единица</span>
          <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {unitsFor.map((u) => <option key={u.id} value={u.unit}>{u.unit}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Сколько</span>
          <input
            inputMode="decimal"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="0"
            required
          />
        </label>
      </div>
      <label className="field">
        <span>Комментарий</span>
        <input
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          placeholder="Необязательно"
        />
      </label>
      <button className="btn btn--accent btn--wide btn--sm" disabled={busy}>
        {busy ? 'Сохраняем…' : 'Записать выработку'}
      </button>
    </form>
  );
}

export default function MyShiftsPage() {
  const [rows, setRows] = useState([]);
  const [units, setUnits] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [account, setAccount] = useState(null);

  const load = useCallback(async () => {
    const [list, piece, money_] = await Promise.all([
      api.get('/api/shifts/my/list'),
      api.get('/api/rates/piece'),
      api.get('/api/payments/me'),
    ]);
    setRows(list);
    setUnits(piece);
    setAccount(money_);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const thisMonth = monthISO();
  const stats = useMemo(() => {
    const mine = rows.filter((r) => r.work_date.slice(0, 7) === thisMonth && r.status === 'approved');
    return {
      count: mine.length,
      pay: mine.reduce((sum, r) => sum + Number(r.pay || 0), 0),
      noOutput: mine.filter((r) => !r.outputs?.length).length,
    };
  }, [rows, thisMonth]);

  if (loading) return <div className="loading">Загрузка…</div>;

  return (
    <>
      <h1 className="page-title">Мои смены</h1>
      <p className="page-sub">После смены запишите, что сделали — по этому считается доплата.</p>

      <div className="kpis" style={{ margin: '14px 0 6px' }}>
        <div className="kpi kpi--dark">
          <div className="kpi__label">Смен в этом месяце</div>
          <div className="kpi__value">{stats.count}</div>
          <div className="kpi__hint">начислено {money(stats.pay)} ₽</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Заработано</div>
          <div className="kpi__value">{money(account?.balance?.earned || 0)} ₽</div>
          {Number(account?.balance?.penalty) > 0 && (
            <div className="kpi__hint">штрафы −{money(account.balance.penalty)} ₽</div>
          )}
        </div>
        <div className="kpi">
          <div className="kpi__label">Выплачено</div>
          <div className="kpi__value">{money(account?.balance?.paid || 0)} ₽</div>
        </div>
        <div className={'kpi ' + (Number(account?.balance?.balance) > 0 ? 'kpi--accent' : '')}>
          <div className="kpi__label">
            {Number(account?.balance?.balance) < 0 ? 'Выдано авансом' : 'Не оплачено'}
          </div>
          <div className="kpi__value">{money(Math.abs(account?.balance?.balance || 0))} ₽</div>
        </div>
      </div>

      {Number(account?.balance?.pending) > 0 && (
        <div className="alert alert--warn">
          Ещё {money(account.balance.pending)} ₽ за {account.balance.pending_count}{' '}
          {plural(Number(account.balance.pending_count), 'смену', 'смены', 'смен')} —
          деньги начислятся, когда старший закроет смену.
        </div>
      )}

      {account && (account.payments.length > 0 || account.penalties.length > 0) && (
        <>
          <div className="section">Расчёты со мной</div>
          <div className="card card--flat">
            {account.payments.map((p) => (
              <div className="person" key={p.id}>
                <div>
                  <div className="person__name">Выплачено {money(p.amount)} ₽</div>
                  <div className="person__meta">
                    {longDate(p.paid_on)}
                    {p.comment ? ` · ${p.comment}` : ''}
                  </div>
                </div>
              </div>
            ))}
            {account.penalties.map((f) => (
              <div className="person" key={f.id}>
                <div>
                  <div className="person__name" style={{ color: 'var(--bad)' }}>
                    Штраф −{money(f.amount)} ₽
                  </div>
                  <div className="person__meta">{longDate(f.penalty_on)} · {f.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {stats.noOutput > 0 && (
        <div className="alert" style={{ borderColor: 'var(--wait)', background: 'var(--wait-soft)', color: '#7a4400' }}>
          Не заполнена выработка: {stats.noOutput} {plural(stats.noOutput, 'смена', 'смены', 'смен')}.
        </div>
      )}

      {!rows.length && <div className="empty">Вы пока никуда не записывались. Загляните в «График».</div>}

      {rows.map((r) => {
        const open = openId === r.signup_id;
        const total = (r.outputs || []).reduce((s, o) => s + Number(o.quantity), 0);
        return (
          <div className="card" key={r.signup_id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'center', minWidth: 44 }}>
                <div className="num" style={{ fontSize: 26, lineHeight: 1 }}>{dayNum(r.work_date)}</div>
                <div className="small muted">{monthShort(r.work_date)} · {weekday(r.work_date)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{KIND_NAME[r.kind]} смена</div>
                <div className="small muted">
                  {STATUS_NAME[r.status]}
                  {r.outputs?.length ? ` · выработка ${qty(total)}` : ' · выработка не внесена'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 18 }}>{money(r.pay)} ₽</div>
                <div className="small muted">{r.closed ? 'начислено' : 'ждёт закрытия'}</div>
              </div>
            </div>

            {r.status === 'approved' && (
              <>
                <button
                  className="btn btn--ghost btn--sm btn--wide"
                  style={{ marginTop: 10 }}
                  onClick={() => setOpenId(open ? null : r.signup_id)}
                >
                  {open ? 'Свернуть' : 'Выработка за смену'}
                </button>

                {open && (
                  <div style={{ marginTop: 10 }}>
                    {(r.outputs || []).map((o) => (
                      <div className="person" key={o.id}>
                        <div>
                          <div className="person__name">{o.work_type === 'FBO' ? 'ФБО' : 'ФБС'} · {qty(o.quantity)} {o.unit}</div>
                          <div className="person__meta">{longDate(r.work_date)}</div>
                        </div>
                        <div className="person__side">
                          <button
                            className="btn btn--sm btn--ghost"
                            onClick={async () => { await api.del(`/api/outputs/${o.id}`); load(); }}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                    {!r.closed && <OutputForm signupId={r.signup_id} units={units} onSaved={load} />}
                    {r.closed && <div className="small muted" style={{ marginTop: 8 }}>Смена закрыта, изменить нельзя.</div>}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
