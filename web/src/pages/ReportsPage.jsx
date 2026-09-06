import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import MonthNav from '../components/MonthNav.jsx';
import {
  monthISO, shiftMonth, money, qty, ROLE_NAME, KIND_NAME, plural, monthTitle,
} from '../lib/format.js';

export default function ReportsPage() {
  const { can } = useAuth();
  const [month, setMonth] = useState(monthISO());
  const [payroll, setPayroll] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pay, out] = await Promise.all([
        can.seeMoney ? api.get(`/api/reports/payroll?month=${month}`) : Promise.resolve(null),
        api.get(`/api/reports/output?month=${month}`),
      ]);
      setPayroll(pay);
      setOutput(out);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, can.seeMoney]);

  useEffect(() => { load(); }, [load]);

  const t = payroll?.totals;
  const avg = t?.shifts_count ? t.total_amount / t.shifts_count : 0;

  return (
    <>
      <h1 className="page-title">Отчёты</h1>
      <p className="page-sub">
        {can.seeMoney ? 'Затраты на персонал и выработка за месяц.' : 'Выработка склада за месяц.'}
      </p>

      <MonthNav
        month={month}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
      />

      {error && <div className="alert">{error}</div>}
      {loading && <div className="loading">Считаем…</div>}

      {!loading && can.seeMoney && t && (
        <>
          <div className="kpis" style={{ marginBottom: 16 }}>
            <div className="kpi kpi--accent">
              <div className="kpi__label">Всего за месяц</div>
              <div className="kpi__value">{money(t.total_amount)} ₽</div>
              <div className="kpi__hint">{monthTitle(month)}</div>
            </div>
            <div className="kpi">
              <div className="kpi__label">Выходов</div>
              <div className="kpi__value">{t.shifts_count}</div>
              <div className="kpi__hint">{t.people} {plural(t.people, 'человек', 'человека', 'человек')}</div>
            </div>
            <div className="kpi kpi--light">
              <div className="kpi__label">Ставки</div>
              <div className="kpi__value">{money(t.shift_amount)} ₽</div>
            </div>
            <div className="kpi kpi--light">
              <div className="kpi__label">Сдельно</div>
              <div className="kpi__value">{money(t.piece_amount)} ₽</div>
            </div>
          </div>

          <div className="card card--flat">
            <div className="small muted">
              Средняя стоимость одного выхода — <b>{money(avg)} ₽</b>.
              Не вышедшие и неподтверждённые в расчёт не берутся.
            </div>
          </div>

          <div className="section">По сотрудникам</div>
          <div className="card scroll-x">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th className="n">Смен</th>
                  <th className="n">Ставки</th>
                  <th className="n">Сдельно</th>
                  <th className="n">Итого</th>
                </tr>
              </thead>
              <tbody>
                {!payroll.byEmployee.length && (
                  <tr><td colSpan="5" className="muted">В этом месяце выходов не было.</td></tr>
                )}
                {payroll.byEmployee.map((r) => (
                  <tr key={r.employee_id}>
                    <td>
                      {r.employee_name}
                      <div className="small muted">{ROLE_NAME[r.role]}</div>
                    </td>
                    <td className="n">
                      {r.shifts_count}
                      <div className="small muted">{r.day_count}д / {r.night_count}н</div>
                    </td>
                    <td className="n">{money(r.shift_amount)}</td>
                    <td className="n">{money(r.piece_amount)}</td>
                    <td className="n"><b>{money(r.total_amount)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">По должностям</div>
          <div className="card">
            <table className="tbl">
              <tbody>
                {payroll.byRole.map((r) => (
                  <tr key={`${r.role}-${r.kind}`}>
                    <td>{ROLE_NAME[r.role]}<div className="small muted">{KIND_NAME[r.kind]}</div></td>
                    <td className="n">{r.shifts_count} {plural(Number(r.shifts_count), 'выход', 'выхода', 'выходов')}</td>
                    <td className="n"><b>{money(r.total_amount)} ₽</b></td>
                  </tr>
                ))}
                {!payroll.byRole.length && <tr><td className="muted">Нет данных.</td></tr>}
              </tbody>
            </table>
          </div>

          <button
            className="btn btn--ghost btn--wide"
            style={{ marginBottom: 18 }}
            onClick={() => api.download(`/api/reports/payroll.csv?month=${month}`, `smena-${month}.csv`)}
          >
            Выгрузить в Excel
          </button>
        </>
      )}

      {!loading && output && (
        <>
          <div className="section">Выработка · ФБО и ФБС</div>
          <div className="card">
            <table className="tbl">
              <thead>
                <tr><th>Тип</th><th>Единица</th><th className="n">Сделано</th><th className="n">Смен</th></tr>
              </thead>
              <tbody>
                {!output.byType.length && (
                  <tr><td colSpan="4" className="muted">Выработку ещё не вносили.</td></tr>
                )}
                {output.byType.map((r) => (
                  <tr key={`${r.work_type}-${r.unit}`}>
                    <td><b>{r.work_type === 'FBO' ? 'ФБО' : 'ФБС'}</b></td>
                    <td>{r.unit}</td>
                    <td className="n">{qty(r.quantity)}</td>
                    <td className="n">{r.shifts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">Кто сколько сделал</div>
          <div className="card scroll-x">
            <table className="tbl">
              <thead>
                <tr><th>Сотрудник</th><th>Тип</th><th>Единица</th><th className="n">Кол-во</th></tr>
              </thead>
              <tbody>
                {!output.byEmployee.length && (
                  <tr><td colSpan="4" className="muted">Нет данных.</td></tr>
                )}
                {output.byEmployee.map((r, i) => (
                  <tr key={i}>
                    <td>{r.employee_name}</td>
                    <td>{r.work_type === 'FBO' ? 'ФБО' : 'ФБС'}</td>
                    <td>{r.unit}</td>
                    <td className="n">{qty(r.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
