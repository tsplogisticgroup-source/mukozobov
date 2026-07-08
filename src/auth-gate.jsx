import React, { useState, useEffect } from 'react';
import { supabase } from './config.js';
import { DUCK_VB, DUCK_PATH } from './duck.js';

// «Ворота» доступа: пока пользователь не вошёл — показываем форму входа.
// После успешного входа показываем само приложение (children).
export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = ещё проверяем
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const m = error.message || '';
      if (/Invalid login credentials/i.test(m)) {
        setError('Неверный логин или пароль (или аккаунт ещё не создан в Supabase)');
      } else if (/Email not confirmed/i.test(m)) {
        setError('Аккаунт не подтверждён. В Supabase включите Auto Confirm для пользователя.');
      } else {
        setError(m);
      }
    }
  }

  if (session === undefined) {
    return <div style={{ minHeight: '100vh', background: '#181510' }} />;
  }

  if (session) {
    // Роль определяется аккаунтом (метаданные пользователя в Supabase),
    // а не выбирается вручную. Прокидываем её в localStorage до монтирования
    // приложения — оно читает 'sklad_role' оттуда и пропускает экран выбора.
    const accRole = session.user?.app_metadata?.role || session.user?.user_metadata?.role;
    if (accRole) {
      try {
        if (localStorage.getItem('sklad_role') !== accRole) localStorage.setItem('sklad_role', accRole);
      } catch (_) {}
    }
    return children;
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#181510', padding: 20, boxSizing: 'border-box',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#221E17', padding: 34, borderRadius: 18, width: 340,
        border: '1px solid #393226', boxShadow: '0 24px 60px -20px rgba(0,0,0,.6)',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, background: '#8A8268',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 22px -8px rgba(0,0,0,.6)',
          }}>
            <svg viewBox={DUCK_VB} width={36} height={34} xmlns="http://www.w3.org/2000/svg">
              <path d={DUCK_PATH} fill="#F3F0DA" fillRule="evenodd" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#EFE7D6', fontFamily: "'Space Grotesk', sans-serif" }}>Носим сутками</div>
            <div style={{ fontSize: 12.5, color: '#9B9078' }}>Склад · вход</div>
          </div>
        </div>

        <div style={{ height: 22 }} />

        <label style={labelStyle}>Логин (email)</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="username" required style={inputStyle} />

        <label style={labelStyle}>Пароль</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="current-password" required style={inputStyle} />

        {error && <div style={{ color: '#E28B6A', fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px 0', border: 'none', borderRadius: 11,
          background: '#D9A441', color: '#241D0E', fontSize: 15, fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
          boxShadow: '0 8px 22px -10px #D9A441',
        }}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { fontSize: 13, color: '#9B9078', display: 'block', marginBottom: 5 };
const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', marginBottom: 16,
  border: '1px solid #393226', borderRadius: 10, fontSize: 14,
  background: '#1E1A14', color: '#EFE7D6', outline: 'none',
};
