import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import {
  dayNum, monthShort, weekday, isWeekend, monthISO, monthBounds,
  shiftMonth, todayISO, initials, KIND_NAME,
} from '../lib/format.js';
import ShiftSheet from '../components/ShiftSheet.jsx';
import MonthNav from '../components/MonthNav.jsx';

function Face({ s }) {
  const photo = api.fileUrl(s.photo_path);
  const cls = 'face' + (s.status === 'requested' ? ' face--wait' : '');
  if (photo) return <img className={cls} src={photo} alt={s.last_name} title={s.last_name} />;
  return <span className={cls} title={s.last_name}>{initials(s)}</span>;
}

// Одна смена внутри дня: дневная или ночная.
function Slot({ shift, onOpen, mySignup }) {
  const need = Number(shift.need_picker) + Number(shift.need_senior);
  const have = Number(shift.picker_count) + Number(shift.senior_count);
  const pct = need ? Math.min(100, Math.round((have / need) * 100)) : have ? 100 : 0;
  const fill = !need ? '' : have >= need ? ' slot__fill--ok' : have === 0 ? ' slot__fill--low' : '';
  const bar = !need ? 'part' : have >= need ? '' : have === 0 ? 'low' : 'part';
  const people = shift.signups || [];

  return (
    <button className={`slot slot--${shift.kind}`} onClick={onOpen}>
      <div className="slot__head">
        <span className="slot__kind">{KIND_NAME[shift.kind]}</span>
        {shift.closed && <span className="chip">Закрыта</span>}
        {mySignup?.status === 'approved' && <span className="chip chip--ok">Я в смене</span>}
        {mySignup?.status === 'requested' && <span className="chip chip--wait">Заявка</span>}
        <span className={`slot__fill${fill}`}>{have}{need ? ` / ${need}` : ''}</span>
      </div>

      <div className="bar"><i className={bar} style={{ width: `${pct}%` }} /></div>

      {shift.note && <div className="slot__note">{shift.note}</div>}

      {people.length ? (
        <div className="faces">
          {people.slice(0, 12).map((s) => <Face key={s.id} s={s} />)}
          {people.length > 12 && <span className="small muted">+{people.length - 12}</span>}
          {Number(shift.requested_count) > 0 && (
            <span className="chip chip--wait" style={{ marginLeft: 4 }}>
              {shift.requested_count} на подтверждение
            </span>
          )}
        </div>
      ) : (
        <div className="small muted">Никто не записан</div>
      )}
    </button>
  );
}

export default function ShiftsPage() {
  const { me, can } = useAuth();
  const [month, setMonth] = useState(monthISO());
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [need, setNeed] = useState({ picker: 3, senior: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = monthBounds(month);
      setShifts(await api.get(`/api/shifts?from=${from}&to=${to}`));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  // Открываем месяц сразу на сегодняшнем дне, а не на первом числе.
  const todayRef = useRef(null);
  useEffect(() => {
    if (!loading && todayRef.current) todayRef.current.scrollIntoView({ block: 'center' });
  }, [loading, month]);

  const mySignupOf = (shift) => (shift.signups || []).find((s) => s.employee_id === me.id);
  const today = todayISO();

  // Дневная и ночная смены одного числа показываются одной карточкой дня.
  const days = useMemo(() => {
    const visible = onlyMine ? shifts.filter((s) => mySignupOf(s)) : shifts;
    const map = new Map();
    for (const s of visible) {
      if (!map.has(s.work_date)) map.set(s.work_date, []);
      map.get(s.work_date).push(s);
    }
    return [...map.entries()]
      .map(([date, list]) => [date, list.sort((a, b) => (a.kind === 'day' ? -1 : 1))]);
  }, [shifts, onlyMine]); // eslint-disable-line react-hooks/exhaustive-deps

  const opened = shifts.find((s) => s.id === openId);
  const firstUpcoming = days.findIndex(([date]) => date >= today);

  async function createMonth(e) {
    e.preventDefault();
    const { from, to } = monthBounds(month);
    await api.post('/api/shifts/bulk', {
      from, to,
      need_picker: Number(need.picker) || 0,
      need_senior: Number(need.senior) || 0,
    });
    setOpenForm(false);
    load();
  }

  return (
    <>
      <h1 className="page-title">График смен</h1>
      <p className="page-sub">
        Дневная и ночная. Записывайтесь заранее — старший подтвердит состав.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '18px 0 14px' }}>
        <div style={{ flex: '1 1 260px' }}>
          <MonthNav
            month={month}
            onPrev={() => setMonth(shiftMonth(month, -1))}
            onNext={() => setMonth(shiftMonth(month, 1))}
          />
        </div>
        <button
          className={`btn btn--sm ${onlyMine ? 'btn--accent' : 'btn--ghost'}`}
          onClick={() => setOnlyMine(!onlyMine)}
        >
          {onlyMine ? 'Показать все' : 'Только мои'}
        </button>
        {can.manageShifts && (
          <button className="btn btn--sm btn--ghost" onClick={() => setOpenForm(!openForm)}>
            Открыть месяц
          </button>
        )}
      </div>

      {openForm && (
        <form className="card" onSubmit={createMonth}>
          <div className="small muted" style={{ marginBottom: 12 }}>
            Создадим дневную и ночную смену на каждый день месяца. Уже открытые дни
            останутся как есть.
          </div>
          <div className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <label className="field">
              <span>Комплектовщиков в смену</span>
              <input type="number" min="0" value={need.picker}
                onChange={(e) => setNeed({ ...need, picker: e.target.value })} />
            </label>
            <label className="field">
              <span>Старших</span>
              <input type="number" min="0" value={need.senior}
                onChange={(e) => setNeed({ ...need, senior: e.target.value })} />
            </label>
            <button className="btn btn--accent" style={{ flex: '0 0 auto', marginBottom: 14 }}>
              Открыть
            </button>
          </div>
        </form>
      )}

      {error && <div className="alert">{error}</div>}
      {loading && <div className="loading">Загрузка…</div>}

      {!loading && !days.length && (
        <div className="empty">
          {onlyMine
            ? 'В этом месяце вы пока никуда не записаны.'
            : can.manageShifts
              ? 'Смен ещё нет. Нажмите «Открыть месяц» — появятся дневные и ночные смены на каждый день.'
              : 'Смены на этот месяц ещё не открыты.'}
        </div>
      )}

      <div className="grid-shifts">
        {!loading && days.map(([date, list], i) => (
          <article
            key={date}
            ref={i === firstUpcoming ? todayRef : null}
            className={'day'
              + (date === today ? ' day--today' : '')
              + (isWeekend(date) ? ' day--weekend' : '')}
          >
            <header className="day__head">
              <span className="day__num">{dayNum(date)}</span>
              <span className="day__mon">{monthShort(date)}</span>
              <span className="day__wd">{weekday(date)}</span>
              {date === today && <span className="chip chip--wait">Сегодня</span>}
            </header>
            {list.map((shift) => (
              <Slot
                key={shift.id}
                shift={shift}
                mySignup={mySignupOf(shift)}
                onOpen={() => setOpenId(shift.id)}
              />
            ))}
          </article>
        ))}
      </div>

      {opened && (
        <ShiftSheet shift={opened} onClose={() => setOpenId(null)} onChanged={load} />
      )}
    </>
  );
}
