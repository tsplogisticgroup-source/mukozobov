import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { initials, money, todayISO, plural, ROLE_NAME, KIND_NAME, longDate } from '../lib/format.js';

const METHOD = { cash: 'Наличными', card: 'На карту', account: 'На счёт' };

// Карточка сотрудника: вся история начислений, выплат и штрафов + формы.
function EmployeeSheet({ employeeId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pay, setPay] = useState({ amount: '', paid_on: todayISO(), method: 'cash', comment: '' });
  const [fine, setFine] = useState({ amount: '', reason: '', penalty_on: todayISO() });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setData(await api.get(`/api/payments/employee/${employeeId}`));
  }, [employeeId]);

  useEffect(() => { load(); }, [load]);

  // Сумма выплаты по умолчанию — весь остаток долга.
  useEffect(() => {
    if (data && !pay.amount) {
      setPay((p) => ({ ...p, amount: String(Math.max(0, Math.round(data.balance.balance))) }));
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(fn) {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!data) return null;
  const b = data.balance;

  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <div>
            <h2 style={{ fontSize: 22 }}>{b.employee_name}</h2>
            <div className="small muted">{ROLE_NAME[b.role]} · {b.shifts_count} смен</div>
          </div>
          <button className="sheet__close" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="kpis" style={{ marginBottom: 16 }}>
          <div className="kpi kpi--dark">
            <div className="kpi__label">Начислено</div>
            <div className="kpi__value">{money(b.earned)} ₽</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Штрафы</div>
            <div className="kpi__value">−{money(b.penalty)} ₽</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Выплачено</div>
            <div className="kpi__value">{money(b.paid)} ₽</div>
          </div>
          <div className={'kpi ' + (Number(b.balance) > 0 ? 'kpi--accent' : '')}>
            <div className="kpi__label">{Number(b.balance) < 0 ? 'Переплата' : 'К выплате'}</div>
            <div className="kpi__value">{money(Math.abs(b.balance))} ₽</div>
          </div>
        </div>

        {Number(b.pending) > 0 && (
          <div className="alert alert--warn">
            Ещё {money(b.pending)} ₽ за {b.pending_count}{' '}
            {plural(Number(b.pending_count), 'смену', 'смены', 'смен')} не в счёт —
            эти смены пока не закрыты.
          </div>
        )}

        <div className="section">За что начислено</div>
        <div className="card scroll-x">
          <table className="tbl">
            <thead>
              <tr>
                <th>Смена</th>
                <th className="n">Ставка</th>
                <th className="n">Сдельно</th>
                <th className="n">Итого</th>
              </tr>
            </thead>
            <tbody>
              {!data.earnings.length && (
                <tr><td colSpan="4" className="muted">Отработанных смен пока нет.</td></tr>
              )}
              {data.earnings.map((r) => (
                <tr key={r.signup_id} style={r.shift_closed ? undefined : { opacity: 0.55 }}>
                  <td>
                    {longDate(r.work_date)} · {KIND_NAME[r.kind].toLowerCase()}
                    {!r.shift_closed && <div className="small muted">смена не закрыта</div>}
                  </td>
                  <td className="n">{money(r.shift_amount)}</td>
                  <td className="n">{money(r.piece_amount)}</td>
                  <td className="n"><b>{money(r.total_amount)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section">Выплатить</div>
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            act(async () => {
              await api.post('/api/payments', {
                employee_id: employeeId,
                amount: Number(String(pay.amount).replace(',', '.')),
                paid_on: pay.paid_on,
                method: pay.method,
                comment: pay.comment,
              });
              setPay({ amount: '', paid_on: todayISO(), method: 'cash', comment: '' });
            });
          }}
        >
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <label className="field">
              <span>Сумма, ₽</span>
              <input inputMode="decimal" required value={pay.amount}
                onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
            </label>
            <label className="field">
              <span>Дата</span>
              <input type="date" value={pay.paid_on}
                onChange={(e) => setPay({ ...pay, paid_on: e.target.value })} />
            </label>
            <label className="field">
              <span>Как</span>
              <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                <option value="cash">Наличными</option>
                <option value="card">На карту</option>
                <option value="account">На счёт</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Комментарий</span>
            <input value={pay.comment} placeholder="Необязательно"
              onChange={(e) => setPay({ ...pay, comment: e.target.value })} />
          </label>
          <button className="btn btn--accent btn--wide" disabled={busy}>Записать выплату</button>
        </form>

        <div className="section">Штраф</div>
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            act(async () => {
              await api.post('/api/payments/penalties', {
                employee_id: employeeId,
                amount: Number(String(fine.amount).replace(',', '.')),
                reason: fine.reason,
                penalty_on: fine.penalty_on,
              });
              setFine({ amount: '', reason: '', penalty_on: todayISO() });
            });
          }}
        >
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <label className="field">
              <span>Сумма, ₽</span>
              <input inputMode="decimal" required value={fine.amount}
                onChange={(e) => setFine({ ...fine, amount: e.target.value })} />
            </label>
            <label className="field">
              <span>Дата</span>
              <input type="date" value={fine.penalty_on}
                onChange={(e) => setFine({ ...fine, penalty_on: e.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>За что</span>
            <input required value={fine.reason} placeholder="Например: брак при сборке, опоздание"
              onChange={(e) => setFine({ ...fine, reason: e.target.value })} />
          </label>
          <button className="btn btn--wide" disabled={busy}>Выставить штраф</button>
        </form>

        <div className="section">История выплат</div>
        <div className="card card--flat">
          {!data.payments.length && <div className="small muted">Выплат пока не было.</div>}
          {data.payments.map((p) => (
            <div className="person" key={p.id}>
              <div>
                <div className="person__name">{money(p.amount)} ₽ · {METHOD[p.method]}</div>
                <div className="person__meta">
                  {longDate(p.paid_on)}
                  {p.comment ? ` · ${p.comment}` : ''}
                </div>
              </div>
              <div className="person__side">
                <button className="btn btn--sm btn--ghost" disabled={busy}
                  onClick={() => act(() => api.del(`/api/payments/${p.id}`))}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="section">Штрафы</div>
        <div className="card card--flat">
          {!data.penalties.length && <div className="small muted">Штрафов нет.</div>}
          {data.penalties.map((f) => (
            <div className="person" key={f.id}>
              <div>
                <div className="person__name">−{money(f.amount)} ₽</div>
                <div className="person__meta">{longDate(f.penalty_on)} · {f.reason}</div>
              </div>
              <div className="person__side">
                <button className="btn btn--sm btn--ghost" disabled={busy}
                  onClick={() => act(() => api.del(`/api/payments/penalties/${f.id}`))}>
                  Снять
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [data, setData] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await api.get('/api/payments/debts'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <div className="loading">Загрузка…</div>;

  const debtors = data.rows.filter((r) => Number(r.balance) > 0);
  const settled = data.rows.filter((r) => Number(r.balance) <= 0);

  return (
    <>
      <h1 className="page-title">Выплаты</h1>
      <p className="page-sub">
        Кому и сколько осталось отдать. Нажмите на человека, чтобы записать выплату
        или выставить штраф.
      </p>

      <div className="kpis" style={{ margin: '18px 0 6px' }}>
        <div className="kpi kpi--accent">
          <div className="kpi__label">Долг по всем</div>
          <div className="kpi__value">{money(data.totals.balance)} ₽</div>
          <div className="kpi__hint">{debtors.length} чел.</div>
        </div>
        <div className="kpi kpi--dark">
          <div className="kpi__label">Начислено всего</div>
          <div className="kpi__value">{money(data.totals.earned)} ₽</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Выплачено</div>
          <div className="kpi__value">{money(data.totals.paid)} ₽</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Ждёт закрытия смен</div>
          <div className="kpi__value">{money(data.totals.pending)} ₽</div>
          <div className="kpi__hint">пока не в долге</div>
        </div>
      </div>

      {data.totals.pending > 0 && (
        <div className="card card--flat">
          <div className="small muted">
            Деньги попадают в долг только после того, как смена закрыта. Отработали —
            зайдите в «График», откройте смену и нажмите «Смена отработана — закрыть».
          </div>
        </div>
      )}

      <div className="section">Ждут оплаты · {debtors.length}</div>
      <div className="card">
        {!debtors.length && <div className="small muted">Все рассчитаны, долгов нет.</div>}
        {debtors.map((r) => (
          <div className="person" key={r.employee_id}>
            {r.photo_path
              ? <img className="avatar" src={api.fileUrl(r.photo_path)} alt="" />
              : <span className="avatar">{initials({ last_name: r.employee_name, first_name: r.employee_name.split(' ')[1] || '' })}</span>}
            <div>
              <div className="person__name">{r.employee_name}</div>
              <div className="person__meta">
                {ROLE_NAME[r.role]} · {r.shifts_count} смен · начислено {money(r.earned)} ₽
                {Number(r.penalty) > 0 ? ` · штрафы ${money(r.penalty)} ₽` : ''}
              </div>
            </div>
            <div className="person__side">
              <span className="num" style={{ fontSize: 18 }}>{money(r.balance)} ₽</span>
              <button className="btn btn--sm btn--accent" onClick={() => setOpenId(r.employee_id)}>
                Оплатить
              </button>
            </div>
          </div>
        ))}
      </div>

      {settled.length > 0 && (
        <>
          <div className="section">Рассчитаны · {settled.length}</div>
          <div className="card card--flat">
            {settled.map((r) => (
              <div className="person" key={r.employee_id}>
                <div>
                  <div className="person__name">{r.employee_name}</div>
                  <div className="person__meta">
                    начислено {money(r.earned)} ₽ · выплачено {money(r.paid)} ₽
                    {Number(r.balance) < 0 ? ` · переплата ${money(-r.balance)} ₽` : ''}
                  </div>
                </div>
                <div className="person__side">
                  <button className="btn btn--sm btn--ghost" onClick={() => setOpenId(r.employee_id)}>
                    Открыть
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {openId && (
        <EmployeeSheet
          employeeId={openId}
          onClose={() => setOpenId(null)}
          onChanged={load}
        />
      )}
    </>
  );
}
