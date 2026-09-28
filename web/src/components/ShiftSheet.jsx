import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import {
  initials, longDate, weekday, qty, KIND_NAME, ROLE_SHORT, STATUS_NAME, MARKET_NAME, WORK_NAME,
} from '../lib/format.js';

const chipClass = {
  approved: 'chip chip--ok',
  requested: 'chip chip--wait',
  no_show: 'chip chip--bad',
};

const MARKETS = ['wb', 'ozon'];

// Таблица план/факт по одному маркетплейсу: строки — единицы учёта.
function VolumeEditor({ shift, units, canPlan, canFact, onSaved, setError }) {
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);

  const current = useMemo(() => {
    const m = {};
    for (const v of shift.volumes || []) m[`${v.kind}|${v.marketplace}|${v.work_type}|${v.unit}`] = v.quantity;
    return m;
  }, [shift.volumes]);

  useEffect(() => { setDraft({}); }, [shift.id, shift.volumes]);

  const val = (kind, mp, u) => {
    const k = `${kind}|${mp}|${u.work_type}|${u.unit}`;
    return draft[k] !== undefined ? draft[k] : (current[k] ?? '');
  };

  async function save(kind) {
    setBusy(true);
    setError('');
    try {
      const rows = [];
      for (const mp of MARKETS) {
        for (const u of units) {
          const k = `${kind}|${mp}|${u.work_type}|${u.unit}`;
          if (draft[k] === undefined) continue;
          rows.push({ marketplace: mp, work_type: u.work_type, unit: u.unit, quantity: draft[k] });
        }
      }
      if (rows.length) await api.put(`/api/shifts/${shift.id}/${kind}`, rows);
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const dirty = (kind) => Object.keys(draft).some((k) => k.startsWith(kind + '|'));
  const editable = canPlan || canFact;

  return (
    <div className="card">
      <div className="vol-head">
        <span>Вид работ</span>
        {MARKETS.map((mp) => <span key={mp} className="vol-mp">{MARKET_NAME[mp]}</span>)}
      </div>
      <div className="vol-sub">
        <span />
        {MARKETS.map((mp) => (
          <span key={mp} className="vol-sub__pair"><i>план</i><i>факт</i></span>
        ))}
      </div>

      {units.map((u) => (
        <div className="vol-row" key={u.id}>
          <span className="vol-row__name">{WORK_NAME[u.work_type]} · {u.unit}</span>
          {MARKETS.map((mp) => (
            <span className="vol-row__pair" key={mp}>
              {['plan', 'fact'].map((kind) => {
                const can = kind === 'plan' ? canPlan : canFact;
                const v = val(kind, mp, u);
                return can ? (
                  <input
                    key={kind}
                    className={'vol-input' + (kind === 'fact' ? ' vol-input--fact' : '')}
                    inputMode="decimal"
                    placeholder="–"
                    value={v}
                    onChange={(e) => setDraft({ ...draft, [`${kind}|${mp}|${u.work_type}|${u.unit}`]: e.target.value })}
                  />
                ) : (
                  <span key={kind} className={'vol-val' + (kind === 'fact' ? ' vol-val--fact' : '')}>
                    {v === '' ? '–' : qty(v)}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      ))}

      {editable && (
        <div className="row" style={{ marginTop: 12 }}>
          {canPlan && (
            <button className="btn btn--sm btn--ghost" disabled={busy || !dirty('plan')} onClick={() => save('plan')}>
              Сохранить план
            </button>
          )}
          {canFact && (
            <button className="btn btn--sm btn--accent" disabled={busy || !dirty('fact')} onClick={() => save('fact')}>
              Сохранить факт
            </button>
          )}
        </div>
      )}
      {!editable && !(shift.volumes || []).length && (
        <div className="small muted" style={{ marginTop: 8 }}>План на смену пока не поставлен.</div>
      )}
    </div>
  );
}

// Отгрузки смены: кто повёз, куда и сколько.
function Shipments({ shift, canEdit, setError }) {
  const [list, setList] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    driver_id: '', marketplace: 'wb', destination: '', pallets: '', boxes: '', comment: '',
  });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get(`/api/shifts/${shift.id}/shipments`).then(setList).catch((e) => setError(e.message));
    if (canEdit) api.get('/api/drivers').then(setDrivers).catch(() => {});
  }, [shift.id, canEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setList(await api.post(`/api/shifts/${shift.id}/shipments`, {
        ...form,
        driver_id: form.driver_id || null,
        pallets: Number(form.pallets) || 0,
        boxes: Number(form.boxes) || 0,
      }));
      setForm({ driver_id: '', marketplace: 'wb', destination: '', pallets: '', boxes: '', comment: '' });
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm('Удалить отгрузку?')) return;
    try {
      setList(await api.del(`/api/shifts/${shift.id}/shipments/${id}`));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      {list === null && <div className="small muted">Загрузка…</div>}
      {list && !list.length && <div className="small muted">Отгрузок в эту смену не было.</div>}
      {list && list.map((s) => (
        <div className="person" key={s.id}>
          <div>
            <div className="person__name">
              {MARKET_NAME[s.marketplace]} · {s.destination}
            </div>
            <div className="person__meta">
              {s.driver_name ? `${s.driver_name}${s.driver_vehicle ? ` (${s.driver_vehicle})` : ''} · ` : ''}
              {s.pallets ? `${s.pallets} палл.` : ''}{s.pallets && s.boxes ? ' · ' : ''}
              {s.boxes ? `${s.boxes} кор.` : ''}
              {s.comment ? ` · ${s.comment}` : ''}
            </div>
          </div>
          {canEdit && (
            <div className="person__side">
              <button className="btn btn--sm btn--ghost" onClick={() => remove(s.id)}>Удалить</button>
            </div>
          )}
        </div>
      ))}

      {canEdit && !open && (
        <button className="btn btn--sm btn--ghost btn--wide" style={{ marginTop: 8 }} onClick={() => setOpen(true)}>
          + Добавить отгрузку
        </button>
      )}

      {canEdit && open && (
        <form onSubmit={add} style={{ marginTop: 10 }}>
          <div className="row">
            <label className="field">
              <span>Водитель</span>
              <select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">— не указан —</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}{d.vehicle ? ` · ${d.vehicle}` : ''}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Куда</span>
              <select value={form.marketplace} onChange={(e) => setForm({ ...form, marketplace: e.target.value })}>
                <option value="wb">ВБ</option>
                <option value="ozon">Озон</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Склад или адрес</span>
            <input required value={form.destination} placeholder="Например: Коледино"
              onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </label>
          <div className="row">
            <label className="field">
              <span>Паллет</span>
              <input inputMode="numeric" value={form.pallets}
                onChange={(e) => setForm({ ...form, pallets: e.target.value })} />
            </label>
            <label className="field">
              <span>Коробов</span>
              <input inputMode="numeric" value={form.boxes}
                onChange={(e) => setForm({ ...form, boxes: e.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Комментарий</span>
            <input value={form.comment} placeholder="Необязательно"
              onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </label>
          <div className="row">
            <button className="btn btn--accent" disabled={busy}>Записать отгрузку</button>
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Отмена</button>
          </div>
          {!drivers.length && (
            <div className="small muted" style={{ marginTop: 8 }}>
              Водителей пока нет — их заводит руководитель в разделе «Люди».
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default function ShiftSheet({ shift, onClose, onChanged }) {
  const { me, can } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [crew, setCrew] = useState([]);
  const [units, setUnits] = useState([]);
  const [addId, setAddId] = useState('');
  const [hoursDraft, setHoursDraft] = useState({});
  const [need, setNeed] = useState({
    need_picker: shift.need_picker, need_senior: shift.need_senior, note: shift.note || '',
  });

  const signups = shift.signups || [];
  const mine = signups.find((s) => s.employee_id === me.id);

  useEffect(() => {
    api.get('/api/units').then(setUnits).catch(() => {});
    if (can.manageShifts) api.get('/api/employees?status=active').then(setCrew).catch(() => {});
  }, [can.manageShifts]);

  async function act(fn) {
    setBusy(true);
    setError('');
    try {
      await fn();
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveHours(s) {
    const v = hoursDraft[s.id];
    if (v === undefined || String(v) === String(s.hours)) return;
    await act(() => api.patch(`/api/shifts/${shift.id}/signups/${s.id}/hours`, { hours: v }));
    setHoursDraft((d) => { const n = { ...d }; delete n[s.id]; return n; });
  }

  const free = crew.filter((c) => !signups.some((s) => s.employee_id === c.id));
  const approved = signups.filter((s) => s.status === 'approved');
  const totalHours = approved.reduce((a, s) => a + Number(s.hours || 0), 0);

  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <div>
            <h2 style={{ fontSize: 22 }}>{longDate(shift.work_date)}, {weekday(shift.work_date)}</h2>
            <div className="small muted">
              {KIND_NAME[shift.kind]} смена
              {shift.closed && ' · закрыта'}
              {approved.length > 0 && ` · ${approved.length} чел. · ${qty(totalHours)} ч`}
            </div>
          </div>
          <button className="sheet__close" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        {error && <div className="alert">{error}</div>}
        {shift.note && <div className="alert alert--warn">{shift.note}</div>}

        {/* --- запись себя --- */}
        {!shift.closed && (
          mine && ['requested', 'approved'].includes(mine.status) ? (
            <button className="btn btn--ghost btn--wide" disabled={busy}
              onClick={() => act(() => api.del(`/api/shifts/${shift.id}/signup`))}>
              Отменить мою запись
            </button>
          ) : (
            <button className="btn btn--accent btn--wide" disabled={busy}
              onClick={() => act(() => api.post(`/api/shifts/${shift.id}/signup`))}>
              Записаться на смену
            </button>
          )
        )}
        {mine?.status === 'requested' && (
          <p className="small muted" style={{ marginTop: 8 }}>Заявка отправлена, ждём подтверждения старшего.</p>
        )}

        {/* --- план и выработка --- */}
        <div className="section">План и выработка</div>
        <VolumeEditor
          shift={shift}
          units={units}
          canPlan={can.setPlan}
          canFact={can.manageShifts}
          onSaved={onChanged}
          setError={setError}
        />

        {/* --- состав --- */}
        <div className="section">
          Состав · нужно {Number(shift.need_picker) + Number(shift.need_senior) || '—'}
        </div>
        <div className="card card--flat">
          {signups.length === 0 && <div className="small muted">Пока никто не записан.</div>}
          {signups.map((s) => {
            const photo = api.fileUrl(s.photo_path);
            return (
              <div className="person" key={s.id}>
                {photo ? <img className="avatar" src={photo} alt="" /> : <span className="avatar">{initials(s)}</span>}
                <div>
                  <div className="person__name">{s.last_name} {s.first_name}</div>
                  <div className="person__meta">
                    {ROLE_SHORT[s.role]}
                    {s.status === 'approved' && ` · ${qty(s.hours)} ч`}
                  </div>
                </div>
                <div className="person__side">
                  {can.manageShifts && s.status === 'approved' ? (
                    <label className="hours-field">
                      <input
                        inputMode="decimal"
                        value={hoursDraft[s.id] ?? s.hours}
                        onChange={(e) => setHoursDraft({ ...hoursDraft, [s.id]: e.target.value })}
                        onBlur={() => saveHours(s)}
                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={busy}
                      />
                      <span>ч</span>
                    </label>
                  ) : null}
                  <span className={chipClass[s.status] || 'chip'}>{STATUS_NAME[s.status]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- управление составом --- */}
        {can.manageShifts && signups.length > 0 && (
          <>
            <div className="section">Отметить</div>
            <div className="card card--flat">
              {signups.map((s) => (
                <div className="person" key={`act-${s.id}`}>
                  <div>
                    <div className="person__name">{s.last_name} {s.first_name}</div>
                    <div className="person__meta">{STATUS_NAME[s.status]}</div>
                  </div>
                  <div className="person__side">
                    {s.status !== 'approved' && (
                      <button className="btn btn--sm btn--accent" disabled={busy}
                        onClick={() => act(() => api.patch(`/api/shifts/${shift.id}/signups/${s.id}`, { status: 'approved' }))}>
                        В смену
                      </button>
                    )}
                    {s.status === 'requested' && (
                      <button className="btn btn--sm btn--ghost" disabled={busy}
                        onClick={() => act(() => api.patch(`/api/shifts/${shift.id}/signups/${s.id}`, { status: 'rejected' }))}>
                        Нет
                      </button>
                    )}
                    {s.status === 'approved' && (
                      <button className="btn btn--sm btn--danger" disabled={busy}
                        onClick={() => act(() => api.patch(`/api/shifts/${shift.id}/signups/${s.id}`, { status: 'no_show' }))}>
                        Не вышел
                      </button>
                    )}
                    <button className="btn btn--sm btn--ghost" disabled={busy} title="Убрать из смены совсем"
                      onClick={() => {
                        if (!confirm(`Убрать ${s.last_name} ${s.first_name} из смены?`)) return;
                        act(() => api.del(`/api/shifts/${shift.id}/signups/${s.id}`));
                      }}>
                      Убрать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {can.manageShifts && (
          <>
            <div className="section">Поставить в смену</div>
            <div className="row">
              <select value={addId} onChange={(e) => setAddId(e.target.value)}
                style={{ minHeight: 48, border: '1px solid var(--line-2)', borderRadius: 8, padding: '0 10px' }}>
                <option value="">Выберите сотрудника…</option>
                {free.map((c) => (
                  <option key={c.id} value={c.id}>{c.last_name} {c.first_name} · {ROLE_SHORT[c.role]}</option>
                ))}
              </select>
              <button className="btn btn--sm" style={{ flex: '0 0 auto' }} disabled={!addId || busy}
                onClick={() => act(async () => {
                  await api.post(`/api/shifts/${shift.id}/signups`, { employee_id: addId });
                  setAddId('');
                })}>
                Добавить
              </button>
            </div>
          </>
        )}

        {/* --- отгрузки --- */}
        <div className="section">Отгрузки{Number(shift.shipments_count) ? ` · ${shift.shipments_count}` : ''}</div>
        <Shipments shift={shift} canEdit={can.manageShifts} setError={setError} />

        {/* --- потребность и закрытие --- */}
        {can.setPlan && (
          <>
            <div className="section">Потребность в людях</div>
            <div className="row">
              <label className="field">
                <span>Комплектовщиков</span>
                <input type="number" min="0" value={need.need_picker}
                  onChange={(e) => setNeed({ ...need, need_picker: e.target.value })} />
              </label>
              <label className="field">
                <span>Старших</span>
                <input type="number" min="0" value={need.need_senior}
                  onChange={(e) => setNeed({ ...need, need_senior: e.target.value })} />
              </label>
            </div>
            <label className="field">
              <span>Заметка к смене</span>
              <input value={need.note} onChange={(e) => setNeed({ ...need, note: e.target.value })}
                placeholder="Например: приход фуры в 6:00" />
            </label>
            <button className="btn btn--wide" disabled={busy} style={{ marginBottom: 10 }}
              onClick={() => act(() => api.patch(`/api/shifts/${shift.id}`, {
                need_picker: Number(need.need_picker) || 0,
                need_senior: Number(need.need_senior) || 0,
                note: need.note,
              }))}>
              Сохранить
            </button>
          </>
        )}

        {can.manageShifts && (
          <div className="stack">
            <button
              className={shift.closed ? 'btn btn--ghost btn--wide' : 'btn btn--accent btn--wide'}
              disabled={busy}
              onClick={() => act(() => api.patch(`/api/shifts/${shift.id}`, { closed: !shift.closed }))}
            >
              {shift.closed ? 'Открыть смену заново' : 'Смена отработана — закрыть'}
            </button>
            <div className="small muted">
              {shift.closed
                ? 'Смена закрыта: часы начислены, состав и факт менять уже нельзя.'
                : 'Проверьте часы у каждого и факт выработки, потом закрывайте — только после этого начисляется оплата.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
