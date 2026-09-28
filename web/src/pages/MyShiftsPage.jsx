import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import {
  dayNum, monthShort, weekday, longDate, money, qty, monthISO, KIND_NAME, STATUS_NAME, plural,
} from '../lib/format.js';

export default function MyShiftsPage() {
  const [rows, setRows] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [list, acc] = await Promise.all([
      api.get('/api/shifts/my/list'),
      api.get('/api/payments/me'),
    ]);
    setRows(list);
    setAccount(acc);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const thisMonth = monthISO();
  const stats = useMemo(() => {
    const mine = rows.filter((r) => r.work_date.slice(0, 7) === thisMonth && r.status === 'approved');
    return {
      count: mine.length,
      hours: mine.reduce((sum, r) => sum + Number(r.hours || 0), 0),
      pay: mine.reduce((sum, r) => sum + Number(r.pay || 0), 0),
    };
  }, [rows, thisMonth]);

  if (loading) return <div className="loading">Загрузка…</div>;
  const b = account?.balance || {};

  return (
    <>
      <h1 className="page-title">Мои смены</h1>
      <p className="page-sub">Часы за смену проставляет старший, оплата идёт по часам.</p>

      <div className="kpis" style={{ margin: '14px 0 6px' }}>
        <div className="kpi kpi--dark">
          <div className="kpi__label">Смен в этом месяце</div>
          <div className="kpi__value">{stats.count}</div>
          <div className="kpi__hint">{qty(stats.hours)} ч · {money(stats.pay)} ₽</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Заработано</div>
          <div className="kpi__value">{money(b.earned || 0)} ₽</div>
          {Number(b.penalty) > 0 && <div className="kpi__hint">штрафы −{money(b.penalty)} ₽</div>}
        </div>
        <div className="kpi">
          <div className="kpi__label">Выплачено</div>
          <div className="kpi__value">{money(b.paid || 0)} ₽</div>
        </div>
        <div className={'kpi ' + (Number(b.balance) > 0 ? 'kpi--accent' : '')}>
          <div className="kpi__label">{Number(b.balance) < 0 ? 'Выдано авансом' : 'Не оплачено'}</div>
          <div className="kpi__value">{money(Math.abs(b.balance || 0))} ₽</div>
        </div>
      </div>

      {Number(b.pending) > 0 && (
        <div className="alert alert--warn">
          Ещё {money(b.pending)} ₽ за {b.pending_count}{' '}
          {plural(Number(b.pending_count), 'смену', 'смены', 'смен')} —
          начислится, когда старший закроет смену.
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
                  <div className="person__meta">{longDate(p.paid_on)}{p.comment ? ` · ${p.comment}` : ''}</div>
                </div>
              </div>
            ))}
            {account.penalties.map((f) => (
              <div className="person" key={f.id}>
                <div>
                  <div className="person__name" style={{ color: 'var(--bad)' }}>Штраф −{money(f.amount)} ₽</div>
                  <div className="person__meta">{longDate(f.penalty_on)} · {f.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section">Мои выходы</div>
      {!rows.length && <div className="empty">Вы пока никуда не записывались. Загляните в «График».</div>}

      {rows.map((r) => (
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
                {r.status === 'approved' && ` · ${qty(r.hours)} ч × ${money(r.hourly_rate)} ₽`}
              </div>
            </div>
            {r.status === 'approved' && (
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 18 }}>{money(r.pay)} ₽</div>
                <div className="small muted">{r.closed ? 'начислено' : 'ждёт закрытия'}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
