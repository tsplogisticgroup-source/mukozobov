// ====================== НАСТРОЙКИ И ХРАНИЛИЩЕ ======================
// Значения берутся из переменных окружения (.env), а если их нет —
// используются те, что были вшиты в исходный HTML (запасной вариант).

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://rcnadtsjjnsprbntsrtm.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3PkNY-h8Mc_xLYRbOwX7XQ_2HAsEBWf';
const STORAGE_TABLE = 'sklad_kv';

// Адрес Cloudflare Worker — прокси к WB Content API (для печати этикеток).
// app.js обращается к нему как к глобальной переменной WB_PROXY_URL.
window.WB_PROXY_URL =
  import.meta.env.VITE_WB_PROXY_URL || 'https://shrill-term-ab11.tsplogisticgroup.workers.dev';

window.storage = {
  async get(key) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${STORAGE_TABLE}?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error('storage get failed: ' + res.status);
    const rows = await res.json();
    if (!rows.length) return null;
    return { key, value: JSON.stringify(rows[0].value), shared: true };
  },
  async set(key, value) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${STORAGE_TABLE}?on_conflict=key`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({ key, value: JSON.parse(value), updated_at: new Date().toISOString() }),
      }
    );
    if (!res.ok) throw new Error('storage set failed: ' + res.status);
    return { key, value, shared: true };
  },
  async delete(key) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${STORAGE_TABLE}?key=eq.${encodeURIComponent(key)}`,
      { method: 'DELETE', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    return res.ok;
  },
  async listByPrefix(prefix) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${STORAGE_TABLE}?key=like.${encodeURIComponent(prefix)}*&select=key,updated_at&order=key.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error('storage list failed: ' + res.status);
    return res.json();
  },
};
