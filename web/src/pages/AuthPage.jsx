import { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import Mark from '../components/Mark.jsx';

// Телефон вводится как удобно, на сервере приводится к одному виду.
export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    phone: '', password: '', last_name: '', first_name: '', middle_name: '', birth_date: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.phone, form.password);
      else await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      {/* витрина слева видна только на большом экране */}
      <section className="auth-side">
        <Mark />
        <h2>Смены обувного склада — в одном месте</h2>
        <p>
          Люди сами записываются на дневные и ночные смены, старший подтверждает состав,
          после смены каждый вносит выработку по ФБО и ФБС.
        </p>
        <ul>
          <li>видно заранее, укомплектована ли смена</li>
          <li>пары, короба и заказы — по каждому человеку</li>
          <li>затраты на персонал считаются сами</li>
        </ul>
      </section>

      <div className="auth">
        <div className="auth__logo">
          <Mark />
          <span className="auth__logo-name">СМЕНА</span>
        </div>
        <p className="auth__tag">График смен, выработка и расчёт по обувному складу</p>

        <div className="switcher">
          <button type="button" aria-pressed={mode === 'login'} onClick={() => setMode('login')}>
            Вход
          </button>
          <button type="button" aria-pressed={mode === 'register'} onClick={() => setMode('register')}>
            Регистрация
          </button>
        </div>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label className="field">
                <span>Фамилия</span>
                <input value={form.last_name} onChange={set('last_name')} required autoComplete="family-name" />
              </label>
              <div className="row">
                <label className="field">
                  <span>Имя</span>
                  <input value={form.first_name} onChange={set('first_name')} required autoComplete="given-name" />
                </label>
                <label className="field">
                  <span>Отчество</span>
                  <input value={form.middle_name} onChange={set('middle_name')} autoComplete="additional-name" />
                </label>
              </div>
              <label className="field">
                <span>Дата рождения</span>
                <input type="date" value={form.birth_date} onChange={set('birth_date')} />
              </label>
            </>
          )}

          <label className="field">
            <span>Телефон</span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="+7 999 123-45-67"
              value={form.phone}
              onChange={set('phone')}
              required
              autoComplete="tel"
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          <button className="btn btn--accent btn--wide" disabled={busy}>
            {busy ? 'Секунду…' : mode === 'login' ? 'Войти' : 'Отправить заявку'}
          </button>
        </form>

        {mode === 'register' && (
          <p className="small muted" style={{ marginTop: 16 }}>
            После регистрации руководитель подтвердит вас и назначит должность —
            только после этого откроется запись на смены.
          </p>
        )}
      </div>
    </div>
  );
}
