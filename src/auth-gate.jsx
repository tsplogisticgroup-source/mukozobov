import React, { useState, useEffect } from 'react';
import { supabase } from './config.js';

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
            <svg viewBox="0 0 24 24" width={30} height={30} xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="10.5" cy="15" rx="7" ry="4.8" fill="#F5F0E4" />
              <path d="M4 13.4 L1.6 12.6 L4.3 16.2 Z" fill="#F5F0E4" />
              <circle cx="15.5" cy="9.5" r="3.6" fill="#F5F0E4" />
              <path d="M18.6 8.9 L22.6 9.9 L18.6 11.1 Z" fill="#E8A23C" />
              <circle cx="16.5" cy="8.7" r="0.9" fill="#3A3320" />
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
