import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import MonthNav from '../components/MonthNav.jsx';
import {
  monthISO, shiftMonth, money, qty, longDate, plural, monthTitle,
  ROLE_NAME, KIND_NAME, MARKET_NAME, WORK_NAME,
} from '../lib/format.js';

// Процент выполнения плана; без плана — прочерк.
const pct = (plan, fact) => (Number(plan) > 0 ? Math.round((Number(fact) / Number(plan)) * 100) : null);

export default function ReportsPage() {
  const { can } = useAuth();
  const [month, setMonth] = useState(monthISO());
  const [payroll, setPayroll] = useState(null);
  const [volumes, setVolumes] = useState(null);
  const [shipments, setShipments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pay, vol, ship] = await Promise.all([
        can.seeMoney ? api.get(`/api/reports/payroll?month=${month}`) : Promise.resolve(null),
        api.get(`/api/reports/volumes?month=${month}`),
        api.get(`/api/reports/shipments?month=${month}`),
      ]);
      setPayroll(pay);
      setVolumes(vol);
      setShipments(ship);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, can.seeMoney]);

  useEffect(() => { load(); }, [load]);

  const t = payroll?.totals;

  return (
    <>
      <h1 className="page-title">Отчёты</h1>
      <p className="page-sub">
        {can.seeMoney ? 'План и факт, отгрузки, затраты на персонал за месяц.' : 'План и факт по складу, отгрузки за месяц.'}
      </p>

      <MonthNav month={month}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))} />

      {error && <div className="alert">{error}</div>}
      {loading && <div className="loading">Считаем…</div>}

      {/* ------------------------------------------------ план и факт */}
      {!loading && volumes && (
        <>
          <div className="section">План и факт · {monthTitle(month)}</div>
          <div className="card scroll-x">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Площадка</th><th>Вид работ</th>
                  <th className="n">План</th><th className="n">Факт</th><th className="n">%</th>
                </tr>
              </thead>
              <tbody>
                {!volumes.byLine.length && (
                  <tr><td colSpan="5" className="muted">План и выработку за этот месяц ещё не вносили.</td></tr>
                )}
                {volumes.byLine.map((r, i) => {
                  const p = pct(r.plan, r.fact);
                  return (
                    <tr key={i}>
                      <td><b>{MARKET_NAME[r.marketplace]}</b></td>
                      <td>{WORK_NAME[r.work_type]} · {r.unit}</td>
                      <td className="n">{r.plan ? qty(r.plan) : '–'}</td>
                      <td className="n"><b>{r.fact ? qty(r.fact) : '–'}</b></td>
                      <td className="n" style={{ color: p === null ? 'var(--ink-3)' : p >= 100 ? 'var(--ok)' : p >= 80 ? 'var(--wait)' : 'var(--bad)' }}>
                        {p === null ? '–' : `${p}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ------------------------------------------------ отгрузки */}
      {!loading && shipments && (
        <>
          <div className="section">Отгрузки · {shipments.rows.length}</div>
          <div className="kpis" style={{ marginBottom: 14 }}>
            {['wb', 'ozon'].map((mp) => {
              const r = shipments.byMarketplace.find((x) => x.marketplace === mp);
              return (
                <div className="kpi" key={mp}>
                  <div className="kpi__label">{MARKET_NAME[mp]}</div>
                  <div className="kpi__value">{r ? r.trips : 0} {plural(Number(r?.trips || 0), 'рейс', 'рейса', 'рейсов')}</div>
                  <div className="kpi__hint">{r ? `${r.pallets} палл. · ${r.boxes} кор.` : 'не было'}</div>
                </div>
              );
            })}
          </div>

          {shipments.byDriver.length > 0 && (
            <div className="card">
              <table className="tbl">
                <thead><tr><th>Водитель</th><th className="n">Рейсов</th><th className="n">Паллет</th><th className="n">Коробов</th></tr></thead>
                <tbody>
                  {shipments.byDriver.map((d, i) => (
                    <tr key={i}>
                      <td>{d.driver_name}</td>
                      <td className="n">{d.trips}</td>
                      <td className="n">{d.pallets}</td>
                      <td className="n">{d.boxes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {shipments.rows.length > 0 && (
            <div className="card card--flat">
              {shipments.rows.map((s) => (
                <div className="person" key={s.id}>
                  <div>
                    <div className="person__name">
                      {longDate(s.work_date)} · {MARKET_NAME[s.marketplace]} · {s.destination}
                    </div>
                    <div className="person__meta">
                      {KIND_NAME[s.shift_kind].toLowerCase()} смена
                      {s.driver_name ? ` · ${s.driver_name}` : ''}
                      {s.pallets ? ` · ${s.pallets} палл.` : ''}{s.boxes ? ` · ${s.boxes} кор.` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------ деньги: только собственник */}
      {!loading && can.seeMoney && t && (
        <>
          <div className="section">Затраты на персонал</div>
          <div className="kpis" style={{ marginBottom: 16 }}>
            <div className="kpi kpi--accent">
              <div className="kpi__label">Всего за месяц</div>
              <div className="kpi__value">{money(t.total_amount)} ₽</div>
              <div className="kpi__hint">{monthTitle(month)}</div>
            </div>
            <div className="kpi kpi--dark">
              <div className="kpi__label">Часов</div>
              <div className="kpi__value">{qty(t.hours)}</div>
              <div className="kpi__hint">{t.shifts_count} {plural(t.shifts_count, 'выход', 'выхода', 'выходов')}</div>
            </div>
            <div className="kpi">
              <div className="kpi__label">Людей</div>
              <div className="kpi__value">{t.people}</div>
            </div>
            <div className="kpi">
              <div className="kpi__label">Средний час</div>
              <div className="kpi__value">{t.hours ? money(t.total_amount / t.hours) : 0} ₽</div>
            </div>
          </div>

          <div className="card scroll-x">
            <table className="tbl">
              <thead>
                <tr><th>Сотрудник</th><th className="n">Смен</th><th className="n">Часов</th><th className="n">Итого</th></tr>
              </thead>
              <tbody>
                {!payroll.byEmployee.length && (
                  <tr><td colSpan="4" className="muted">Закрытых смен в этом месяце нет.</td></tr>
                )}
                {payroll.byEmployee.map((r) => (
                  <tr key={r.employee_id}>
                    <td>{r.employee_name}<div className="small muted">{ROLE_NAME[r.role]}</div></td>
                    <td className="n">{r.shifts_count}<div className="small muted">{r.day_count}д / {r.night_count}н</div></td>
                    <td className="n">{qty(r.hours)}</td>
                    <td className="n"><b>{money(r.total_amount)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn--ghost btn--wide" style={{ marginBottom: 18 }}
            onClick={() => api.download(`/api/reports/payroll.csv?month=${month}`, `smena-${month}.csv`)}>
            Выгрузить в Excel
          </button>
        </>
      )}
    </>
  );
}
