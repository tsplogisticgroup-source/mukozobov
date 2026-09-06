import { useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { initials, phoneView, ROLE_NAME } from '../lib/format.js';

export default function ProfilePage() {
  const { me, setMe, logout } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    last_name: me.last_name || '',
    first_name: me.first_name || '',
    middle_name: me.middle_name || '',
    birth_date: me.birth_date ? String(me.birth_date).slice(0, 10) : '',
  });
  const [pwd, setPwd] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const photo = api.fileUrl(me.photo_path);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMsg('');
    try {
      setMe(await api.patch('/api/employees/me', form));
      setMsg('Данные сохранены.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      setMe(await api.upload('/api/employees/me/photo', fd));
      setMsg('Фото обновлено.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api.post('/api/auth/password', pwd);
      setPwd({ current: '', next: '' });
      setMsg('Пароль изменён.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="col-narrow">
      <h1 className="page-title">Профиль</h1>
      <p className="page-sub">{ROLE_NAME[me.role]} · {phoneView(me.phone)}</p>

      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert alert--ok">{msg}</div>}

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {photo
          ? <img src={photo} alt="" style={{ width: 76, height: 76, objectFit: 'cover', border: '1px solid var(--line-2)', borderRadius: 8 }} />
          : <span className="avatar" style={{ width: 76, height: 76, fontSize: 26, borderRadius: 0 }}>{initials(me)}</span>}
        <div>
          <button className="btn btn--sm" disabled={busy} onClick={() => fileRef.current?.click()}>
            {photo ? 'Заменить фото' : 'Загрузить фото'}
          </button>
          <div className="small muted" style={{ marginTop: 6 }}>JPG, PNG или WEBP, до 8 МБ</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
      </div>

      <form onSubmit={save} className="card">
        <label className="field">
          <span>Фамилия</span>
          <input value={form.last_name} required
            onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </label>
        <label className="field">
          <span>Имя</span>
          <input value={form.first_name} required
            onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        </label>
        <label className="field">
          <span>Отчество</span>
          <input value={form.middle_name}
            onChange={(e) => setForm({ ...form, middle_name: e.target.value })} />
        </label>
        <label className="field">
          <span>Дата рождения</span>
          <input type="date" value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
        </label>
        <button className="btn btn--accent btn--wide" disabled={busy}>Сохранить</button>
      </form>

      <div className="section">Пароль</div>
      <form onSubmit={changePassword} className="card">
        <label className="field">
          <span>Текущий пароль</span>
          <input type="password" value={pwd.current} required autoComplete="current-password"
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
        </label>
        <label className="field">
          <span>Новый пароль</span>
          <input type="password" value={pwd.next} required autoComplete="new-password"
            onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
        </label>
        <button className="btn btn--wide">Сменить пароль</button>
      </form>

      <button className="btn btn--ghost btn--wide" onClick={logout}>Выйти</button>
    </div>
  );
}
