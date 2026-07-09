// Cloudflare Worker — посредник к WB Content API для этикеток.
// Токен WB хранится в СЕКРЕТЕ воркера (переменная окружения WB_TOKEN), НЕ в коде.
// Приложение делает GET на адрес воркера → получает {articles, syncedAt, count}.
//
// Деплой:
//   1. dash.cloudflare.com → Workers & Pages → нужный воркер → Edit code → вставить этот файл.
//   2. Settings → Variables and Secrets → добавить секрет WB_TOKEN = <твой токен Контент WB>.
//   3. Deploy.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const token = env.WB_TOKEN;
    if (!token) return json({ error: 'WB_TOKEN не задан в настройках воркера (Settings → Variables and Secrets).' }, 500);

    try {
      const articles = {};
      let cursor = { limit: 100 };

      // Постранично забираем все карточки товаров (Content API v2).
      for (let page = 0; page < 300; page++) {
        const res = await fetch('https://content-api.wildberries.ru/content/v2/get/cards/list', {
          method: 'POST',
          headers: { 'Authorization': token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: { cursor, filter: { withPhoto: -1 } } }),
        });

        if (!res.ok) {
          const t = await res.text();
          return json({ error: `WB API ${res.status}: ${t.slice(0, 400)}` }, 502);
        }

        const data = await res.json();
        const cards = data.cards || [];

        for (const c of cards) {
          const code = String(c.vendorCode || '').trim();
          if (!code) continue;
          if (!articles[code]) {
            articles[code] = { name: c.title || c.subjectName || '', brand: c.brand || '', sizes: {} };
          }
          for (const s of (c.sizes || [])) {
            const size = String(s.techSize || s.wbSize || '').trim();
            const barcode = (s.skus || [])[0];
            if (size && barcode && !articles[code].sizes[size]) {
              articles[code].sizes[size] = String(barcode);
            }
          }
        }

        const cur = data.cursor || {};
        // Последняя страница: карточек меньше лимита или нет курсора для продолжения.
        if (cards.length < cursor.limit || !cur.nmID) break;
        cursor = { updatedAt: cur.updatedAt, nmID: cur.nmID, limit: 100 };
      }

      return json({ articles, syncedAt: new Date().toISOString(), count: Object.keys(articles).length });
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};
