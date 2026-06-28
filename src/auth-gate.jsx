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
    // Проверяем сохранённую сессию при загрузке.
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // Подписываемся на вход/выход, чтобы экран сам переключался.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('Неверный логин или пароль');
  }

  // Ещё проверяем сохранённую сессию — ничего не мигаем.
  if (session === undefined) return null;

  // Вошёл — показываем приложение и маленькую кнопку «Выйти» в углу.
  if (session) {
    return (
      <>
        {children}
        <button
          onClick={() => supabase.auth.signOut()}
          title="Выйти"
          style={{
            position: 'fixed', top: 10, right: 12, zIndex: 9999,
            background: '#fff', border: '1px solid #ddd', borderRadius: 8,
            padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#444',
            boxShadow: '0 1px 3px rgba(0,0,0,.08)',
          }}
        >
          Выйти
        </button>
      </>
    );
  }

  // Не вошёл — форма входа.
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F6F1E7',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Arial, sans-serif',
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#fff', padding: 32, borderRadius: 16, width: 320,
        boxShadow: '0 8px 30px rgba(0,0,0,.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: '#C9551A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700,
          }}>С</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#222' }}>Склад · вход</div>
        </div>

        <label style={{ fontSize: 13, color: '#666' }}>Логин (email)</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="username" required
          style={inputStyle}
        />

        <label style={{ fontSize: 13, color: '#666' }}>Пароль</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password" required
          style={inputStyle}
        />

        {error && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '11px 0', border: 'none', borderRadius: 9,
          background: '#C9551A', color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginTop: 4,
  marginBottom: 16, border: '1px solid #ddd', borderRadius: 9, fontSize: 14,
};
