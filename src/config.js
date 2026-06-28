// ====================== НАСТРОЙКИ, ВХОД И ХРАНИЛИЩЕ ======================
// Значения берутся из переменных окружения (.env), а если их нет —
// используются те, что были вшиты в исходный HTML (запасной вариант).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://rcnadtsjjnsprbntsrtm.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3PkNY-h8Mc_xLYRbOwX7XQ_2HAsEBWf';
const STORAGE_TABLE = 'sklad_kv';

// Клиент Supabase. Сам хранит сессию входа в браузере и обновляет токен.
// Все запросы к базе через него автоматически идут с токеном вошедшего
// пользователя — поэтому при закрытой политике (только authenticated)
// посторонний без входа ничего не получит.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Делаем клиент доступным и как глобал — на случай обращения из app.js.
window.supabase = supabase;

// Адрес Cloudflare Worker — прокси к WB Content API (для печати этикеток).
window.WB_PROXY_URL =
  import.meta.env.VITE_WB_PROXY_URL || 'https://shrill-term-ab11.tsplogisticgroup.workers.dev';

// Хранилище. Интерфейс тот же, что был раньше (get/set/delete/listByPrefix),
// поэтому код приложения менять не нужно. Но теперь запросы идут через
// supabase-js с токеном вошедшего пользователя, а не «голым» ключом.
window.storage = {
  async get(key) {
    const { data, error } = await supabase
      .from(STORAGE_TABLE)
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw new Error('storage get failed: ' + error.message);
    if (!data) return null;
    return { key, value: JSON.stringify(data.value), shared: true };
  },
  async set(key, value) {
    const { error } = await supabase
      .from(STORAGE_TABLE)
      .upsert(
        { key, value: JSON.parse(value), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) throw new Error('storage set failed: ' + error.message);
    return { key, value, shared: true };
  },
  async delete(key) {
    const { error } = await supabase.from(STORAGE_TABLE).delete().eq('key', key);
    return !error;
  },
  async listByPrefix(prefix) {
    const { data, error } = await supabase
      .from(STORAGE_TABLE)
      .select('key,updated_at')
      .like('key', prefix + '%')
      .order('key', { ascending: false });
    if (error) throw new Error('storage list failed: ' + error.message);
    return data || [];
  },
};
