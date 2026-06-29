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
    return <div style={{ minHeight: '100vh', background: '#14131C' }} />;
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
    return (
      <>
        {children}
        <button
          onClick={() => supabase.auth.signOut()}
          title="Выйти"
          style={{
            position: 'fixed', top: 12, right: 14, zIndex: 9999,
            background: '#1E1D2B', border: '1px solid #2E2C40', borderRadius: 9,
            padding: '7px 13px', fontSize: 13, cursor: 'pointer', color: '#C7C3DE',
            fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600,
          }}
        >
          Выйти
        </button>
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#14131C', padding: 20, boxSizing: 'border-box',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#1E1D2B', padding: 34, borderRadius: 18, width: 340,
        border: '1px solid #2E2C40', boxShadow: '0 24px 60px -20px rgba(0,0,0,.6)',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, background: '#7C5CFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            fontWeight: 700, fontSize: 22, boxShadow: '0 8px 22px -6px #7C5CFF',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>С</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#EDEBF5', fontFamily: "'Space Grotesk', sans-serif" }}>Склад</div>
            <div style={{ fontSize: 12.5, color: '#8E8AAE' }}>НОСИМ СУТКАМИ · вход</div>
          </div>
        </div>

        <div style={{ height: 22 }} />

        <label style={labelStyle}>Логин (email)</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="username" required style={inputStyle} />

        <label style={labelStyle}>Пароль</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="current-password" required style={inputStyle} />

        {error && <div style={{ color: '#FF8B8B', fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px 0', border: 'none', borderRadius: 11,
          background: '#7C5CFF', color: '#fff', fontSize: 15, fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
          boxShadow: '0 8px 22px -8px #7C5CFF',
        }}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { fontSize: 13, color: '#8E8AAE', display: 'block', marginBottom: 5 };
const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', marginBottom: 16,
  border: '1px solid #2E2C40', borderRadius: 10, fontSize: 14,
  background: '#181724', color: '#EDEBF5', outline: 'none',
};
