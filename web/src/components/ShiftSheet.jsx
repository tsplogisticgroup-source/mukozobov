import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { initials, longDate, weekday, KIND_NAME, ROLE_SHORT, STATUS_NAME } from '../lib/format.js';

const chipClass = {
  approved: 'chip chip--ok',
  requested: 'chip chip--wait',
  no_show: 'chip chip--bad',
};

export default function ShiftSheet({ shift, onClose, onChanged }) {
  const { me, can } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [crew, setCrew] = useState([]);
  const [addId, setAddId] = useState('');
  const [need, setNeed] = useState({
    need_picker: shift.need_picker, need_senior: shift.need_senior, note: shift.note || '',
  });

  const signups = shift.signups || [];
  const mine = signups.find((s) => s.employee_id === me.id);

  useEffect(() => {
    if (!can.manageShifts) return;
    api.get('/api/employees?status=active').then(setCrew).catch(() => {});
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

  const free = crew.filter((c) => !signups.some((s) => s.employee_id === c.id));

  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <div>
            <h2 style={{ fontSize: 22 }}>{longDate(shift.work_date)}, {weekday(shift.work_date)}</h2>
            <div className="small muted">
              {KIND_NAME[shift.kind]} смена
              {shift.closed && ' · закрыта'}
            </div>
          </div>
          <button className="sheet__close" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        {error && <div className="alert">{error}</div>}

        {shift.note && <div className="alert alert--warn">{shift.note}</div>}

        {/* --- запись себя --- */}
        {!shift.closed && (
          mine && ['requested', 'approved'].includes(mine.status) ? (
            <button
              className="btn btn--ghost btn--wide"
              disabled={busy}
              onClick={() => act(() => api.del(`/api/shifts/${shift.id}/signup`))}
            >
              Отменить мою запись
            </button>
          ) : (
            <button
              className="btn btn--accent btn--wide"
              disabled={busy}
              onClick={() => act(() => api.post(`/api/shifts/${shift.id}/signup`))}
            >
              Записаться на смену
            </button>
          )
        )}

        {mine?.status === 'requested' && (
          <p className="small muted" style={{ marginTop: 8 }}>
            Заявка отправлена, ждём подтверждения старшего.
          </p>
        )}

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
                {photo
                  ? <img className="avatar" src={photo} alt="" />
                  : <span className="avatar">{initials(s)}</span>}
                <div>
                  <div className="person__name">{s.last_name} {s.first_name}</div>
                  <div className="person__meta">
                    {ROLE_SHORT[s.role]}
                    {s.has_output && ' · выработка внесена'}
                  </div>
                </div>
                <div className="person__side">
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
                      <button
                        className="btn btn--sm btn--accent"
                        disabled={busy}
                        onClick={() => act(() => api.patch(
                          `/api/shifts/${shift.id}/signups/${s.id}`, { status: 'approved' },
                        ))}
                      >
                        В смену
                      </button>
                    )}
                    {s.status === 'requested' && (
                      <button
                        className="btn btn--sm btn--ghost"
                        disabled={busy}
                        onClick={() => act(() => api.patch(
                          `/api/shifts/${shift.id}/signups/${s.id}`, { status: 'rejected' },
                        ))}
                      >
                        Нет
                      </button>
                    )}
                    {s.status === 'approved' && (
                      <button
                        className="btn btn--sm btn--danger"
                        disabled={busy}
                        onClick={() => act(() => api.patch(
                          `/api/shifts/${shift.id}/signups/${s.id}`, { status: 'no_show' },
                        ))}
                      >
                        Не вышел
                      </button>
                    )}
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
                  <option key={c.id} value={c.id}>
                    {c.last_name} {c.first_name} · {ROLE_SHORT[c.role]}
                  </option>
                ))}
              </select>
              <button
                className="btn btn--sm"
                style={{ flex: '0 0 auto' }}
                disabled={!addId || busy}
                onClick={() => act(async () => {
                  await api.post(`/api/shifts/${shift.id}/signups`, { employee_id: addId });
                  setAddId('');
                })}
              >
                Добавить
              </button>
            </div>

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

            <div className="stack">
              <button
                className="btn btn--wide"
                disabled={busy}
                onClick={() => act(() => api.patch(`/api/shifts/${shift.id}`, {
                  need_picker: Number(need.need_picker) || 0,
                  need_senior: Number(need.need_senior) || 0,
                  note: need.note,
                }))}
              >
                Сохранить
              </button>
              <button
                className="btn btn--ghost btn--wide"
                disabled={busy}
                onClick={() => act(() => api.patch(`/api/shifts/${shift.id}`, { closed: !shift.closed }))}
              >
                {shift.closed ? 'Открыть смену' : 'Закрыть смену'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
