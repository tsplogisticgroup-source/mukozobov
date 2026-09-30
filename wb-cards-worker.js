// Cloudflare Worker — посредник к API Wildberries.
//   • GET  /                — Content API (каталог этикеток): {articles, cards, syncedAt}.
//   • GET  /fbs/orders/new  — FBS: новые сборочные задания.
//   • GET  /fbs/orders/status?ids=1,2 — статусы заказов (тело в query нельзя, поэтому ids через запятую).
//   • POST /fbs/stickers    — FBS: стикеры на заказы (тело {orders:[id,...]}).
//   • POST /fbs/supplies                    — создать поставку (тело {name}).
//   • GET  /fbs/supplies?limit=&next=       — список поставок.
//   • PATCH /fbs/supplies/{id}/orders      — добавить заказы в поставку (тело {orders:[id,...]}).
//   • PUT  /fbs/orders/{id}/sgtin           — привязать КИЗ Честного Знака (тело {sgtins:[...]}).
//   • PATCH /fbs/supplies/{id}/deliver      — отгрузить поставку.
//   • GET  /fbs/supplies/{id}/barcode?type=png — ШК/QR короба поставки.
//
//   • GET  /ozon/cabinets          — список подключённых кабинетов Ozon (без ключей).
//   • GET  /ozon/catalog?cab=1     — карточки кабинета Ozon: артикул, штрихкоды, размер, бренд, цвет.
//
// Секреты воркера (Settings → Variables and Secrets):
//   WB_TOKEN    — токен Контент (для каталога/этикеток).
//   WB_MP_TOKEN — токен «Маркетплейс» (для FBS).
//   Ozon, по набору на кабинет (N = 1…10):
//     OZON1_CLIENT_ID, OZON1_API_KEY — из кабинета Ozon Seller → Настройки → Seller API (роль «Товары», можно только чтение).
//     OZON1_NAME — название кабинета для ВМС (необязательно, обычная переменная).
//     Второй кабинет — OZON2_CLIENT_ID, OZON2_API_KEY, OZON2_NAME и т.д.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}

// Прозрачный прокси к WB: возвращаем тело и статус как есть, добавляя CORS.
async function proxy(wbUrl, method, mpToken, body) {
  const res = await fetch(wbUrl, {
    method,
    headers: { Authorization: mpToken, 'Content-Type': 'application/json' },
    body: body || undefined,
  });
  // 204/205/304 — ответ без тела (WB так отвечает на «добавить в поставку», КИЗ,
  // «передать в доставку»). Тело к таким статусам прикладывать нельзя — упадёт.
  if (res.status === 204 || res.status === 205 || res.status === 304) {
    return new Response(null, { status: res.status, headers: { ...CORS } });
  }
  const text = await res.text();
  return new Response(text || '{}', {
    status: res.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}

const MP = 'https://marketplace-api.wildberries.ru';

// ── Ozon Seller API ────────────────────────────────────────────────────────────
const OZON = 'https://api-seller.ozon.ru';
// Кабинеты берём из секретов OZON{N}_CLIENT_ID / OZON{N}_API_KEY.
function ozonCabinets(env) {
  const out = [];
  for (let i = 1; i <= 10; i++) {
    const clientId = env[`OZON${i}_CLIENT_ID`], apiKey = env[`OZON${i}_API_KEY`];
    if (clientId && apiKey) out.push({ id: String(i), name: env[`OZON${i}_NAME`] || `Кабинет ${i}`, clientId: String(clientId).trim(), apiKey: String(apiKey).trim() });
  }
  return out;
}
async function ozonCall(cab, path, body) {
  const res = await fetch(OZON + path, {
    method: 'POST',
    headers: { 'Client-Id': cab.clientId, 'Api-Key': cab.apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Ozon ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}
// Запасные названия атрибутов по id — если справочник категории не ответил.
const OZON_ATTR_NAMES = { 85: 'Бренд', 4298: 'Российский размер', 4295: 'Российский размер', 9533: 'Размер производителя', 9024: 'Артикул', 9048: 'Название модели', 8292: 'Объединить на одной карточке', 10096: 'Цвет товара' };
const OZON_ATTR_KEEP = /бренд|размер|артикул|модел|цвет|объединить/i;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;

    // ── FBS (Marketplace API) ────────────────────────────────────────────────
    if (path.startsWith('/fbs/')) {
      const mp = env.WB_MP_TOKEN;
      if (!mp) return json({ error: 'WB_MP_TOKEN не задан в настройках воркера (Settings → Variables and Secrets).' }, 500);
      try {
        if (path === '/fbs/warehouses' && request.method === 'GET') {
          return await proxy(`${MP}/api/v3/warehouses`, 'GET', mp);
        }
        if (path === '/fbs/orders/new' && request.method === 'GET') {
          return await proxy(`${MP}/api/v3/orders/new`, 'GET', mp);
        }
        if (path === '/fbs/orders/status' && request.method === 'GET') {
          const ids = (url.searchParams.get('ids') || '').split(',').map(s => Number(s.trim())).filter(Boolean);
          return await proxy(`${MP}/api/v3/orders/status`, 'POST', mp, JSON.stringify({ orders: ids }));
        }
        // Отмена сборочного задания продавцом (WB берёт штраф — см. правила WB).
        const mCancel = path.match(/^\/fbs\/orders\/([^/]+)\/cancel$/);
        if (mCancel && request.method === 'PATCH') {
          return await proxy(`${MP}/api/v3/orders/${mCancel[1]}/cancel`, 'PATCH', mp);
        }
        // Комиссии WB по предметам (для расчёта штрафа за отмену). Нужен доступ «Тарифы».
        if (path === '/fbs/commission' && request.method === 'GET') {
          return await proxy('https://common-api.wildberries.ru/api/v1/tariffs/commission?locale=ru', 'GET', mp);
        }
        // Привязка кода маркировки «Честный Знак» (КИЗ/sgtin) к заказу.
        const mSgtin = path.match(/^\/fbs\/orders\/([^/]+)\/sgtin$/);
        if (mSgtin && request.method === 'PUT') {
          const body = await request.text();
          return await proxy(`${MP}/api/v3/orders/${mSgtin[1]}/meta/sgtin`, 'PUT', mp, body);
        }
        if (path === '/fbs/stickers' && request.method === 'POST') {
          const qs = url.search || '?type=png&width=58&height=40';
          const body = await request.text();
          return await proxy(`${MP}/api/v3/orders/stickers${qs}`, 'POST', mp, body);
        }
        if (path === '/fbs/supplies' && request.method === 'GET') {
          // WB требует оба параметра пагинации: limit и next (в первом запросе next=0).
          const sp = new URLSearchParams(url.search);
          if (!sp.has('limit')) sp.set('limit', '50');
          if (!sp.has('next')) sp.set('next', '0');
          return await proxy(`${MP}/api/v3/supplies?${sp.toString()}`, 'GET', mp);
        }
        if (path === '/fbs/supplies' && request.method === 'POST') {
          const body = await request.text();
          return await proxy(`${MP}/api/v3/supplies`, 'POST', mp, body);
        }
        // Добавить заказы в поставку. С 18.12.2025 у WB новый метод:
        // PATCH /api/marketplace/v3/supplies/{supplyId}/orders с телом {"orders":[id,...]} (до 100).
        // Старый /api/v3/supplies/{id}/orders/{orderId} отвечает «path not found».
        const mAddMany = path.match(/^\/fbs\/supplies\/([^/]+)\/orders$/);
        if (mAddMany && request.method === 'PATCH') {
          const body = await request.text();
          return await proxy(`${MP}/api/marketplace/v3/supplies/${mAddMany[1]}/orders`, 'PATCH', mp, body);
        }
        const mAdd = path.match(/^\/fbs\/supplies\/([^/]+)\/orders\/([^/]+)$/);
        if (mAdd && request.method === 'PATCH') { // совместимость со старым фронтом: один заказ
          return await proxy(`${MP}/api/marketplace/v3/supplies/${mAdd[1]}/orders`, 'PATCH', mp, JSON.stringify({ orders: [Number(mAdd[2])] }));
        }
        const mDeliver = path.match(/^\/fbs\/supplies\/([^/]+)\/deliver$/);
        if (mDeliver && request.method === 'PATCH') {
          return await proxy(`${MP}/api/v3/supplies/${mDeliver[1]}/deliver`, 'PATCH', mp);
        }
        const mBarcode = path.match(/^\/fbs\/supplies\/([^/]+)\/barcode$/);
        if (mBarcode && request.method === 'GET') {
          const qs = url.search || '?type=png';
          return await proxy(`${MP}/api/v3/supplies/${mBarcode[1]}/barcode${qs}`, 'GET', mp);
        }
        return json({ error: `Неизвестный FBS-маршрут: ${request.method} ${path}` }, 404);
      } catch (e) {
        return json({ error: String((e && e.message) || e) }, 500);
      }
    }

    // ── Ozon: кабинеты и каталог карточек ─────────────────────────────────────
    if (path.startsWith('/ozon/')) {
      const cabs = ozonCabinets(env);
      try {
        if (path === '/ozon/cabinets') {
          return json({ cabinets: cabs.map(c => ({ id: c.id, name: c.name })) });
        }
        if (path === '/ozon/catalog') {
          const cab = cabs.find(c => c.id === (url.searchParams.get('cab') || '1'));
          if (!cab) return json({ error: 'Кабинет Ozon не найден. Добавь в настройках воркера секреты OZON1_CLIENT_ID и OZON1_API_KEY.' }, 404);
          const sample = url.searchParams.get('sample'); // диагностика: сырые первые карточки
          const raw = [];
          let lastId = '';
          for (let page = 0; page < 40; page++) {
            const data = await ozonCall(cab, '/v4/product/info/attributes', { filter: { visibility: 'ALL' }, limit: sample ? 5 : 1000, last_id: lastId, sort_dir: 'ASC' });
            const items = data.result || data.items || [];
            raw.push(...items);
            lastId = data.last_id || '';
            if (sample || !items.length || !lastId || items.length < 1000) break;
          }
          // Названия атрибутов — из справочника категории (по одному запросу на пару категория+тип).
          const names = { ...OZON_ATTR_NAMES };
          const pairs = new Map();
          for (const it of raw) {
            if (it.description_category_id && it.type_id) pairs.set(`${it.description_category_id}:${it.type_id}`, [it.description_category_id, it.type_id]);
          }
          let n = 0;
          for (const [catId, typeId] of pairs.values()) {
            if (++n > 20) break;
            try {
              const a = await ozonCall(cab, '/v1/description-category/attribute', { description_category_id: catId, type_id: typeId, language: 'DEFAULT' });
              for (const x of (a.result || [])) if (x.id && x.name) names[x.id] = x.name;
            } catch (_) { /* останутся запасные названия */ }
          }
          if (sample) return json({ cabinet: { id: cab.id, name: cab.name }, names: Object.fromEntries(Object.entries(names).filter(([, v]) => OZON_ATTR_KEEP.test(v))), raw });
          const products = raw.map(it => {
            const attrs = {};
            for (const a of (it.attributes || [])) {
              const name = names[a.id];
              if (!name || !OZON_ATTR_KEEP.test(name)) continue;
              const v = (a.values || []).map(x => x.value).filter(Boolean).join(', ');
              if (v && !attrs[name]) attrs[name] = v;
            }
            const barcodes = (it.barcodes && it.barcodes.length ? it.barcodes : (it.barcode ? [it.barcode] : [])).map(String).filter(Boolean);
            return { id: it.id, offerId: String(it.offer_id || ''), name: it.name || '', sku: it.sku || null, barcodes, attrs };
          });
          return json({ cabinet: { id: cab.id, name: cab.name }, products, count: products.length, syncedAt: new Date().toISOString() });
        }
        return json({ error: `Неизвестный Ozon-маршрут: ${request.method} ${path}` }, 404);
      } catch (e) {
        return json({ error: String((e && e.message) || e) }, 502);
      }
    }

    // ── Content API (каталог этикеток) — прежнее поведение на корне ───────────
    const token = env.WB_TOKEN;
    if (!token) return json({ error: 'WB_TOKEN не задан в настройках воркера (Settings → Variables and Secrets).' }, 500);

    try {
      const articles = {};   // старый формат (совместимость): vendorCode -> {...}
      const cardsOut = [];    // новый формат: каждая карточка отдельно (с брендом)
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
          // Размеры → штрихкоды этой конкретной карточки (бренда).
          const sizes = {};
          for (const s of (c.sizes || [])) {
            const size = String(s.techSize || s.wbSize || '').trim();
            const barcode = (s.skus || [])[0];
            if (size && barcode && !sizes[size]) sizes[size] = String(barcode);
          }
          // Новый формат: не схлопываем карточки с одинаковым кодом — храним КАЖДУЮ
          // (у одного кода может быть две карточки под разными брендами).
          cardsOut.push({
            vendorCode: code,
            brand: c.brand || '',
            category: c.subjectName || '',
            title: c.title || '',
            sizes,
          });
          // Старый формат: первая карточка кода (для совместимости со старым приложением).
          if (!articles[code]) {
            articles[code] = { name: c.title || '', brand: c.brand || '', category: c.subjectName || '', sizes: {} };
          }
          for (const [size, bc] of Object.entries(sizes)) {
            if (!articles[code].sizes[size]) articles[code].sizes[size] = bc;
          }
        }

        const cur = data.cursor || {};
        // Последняя страница: карточек меньше лимита или нет курсора для продолжения.
        if (cards.length < cursor.limit || !cur.nmID) break;
        cursor = { updatedAt: cur.updatedAt, nmID: cur.nmID, limit: 100 };
      }

      return json({ articles, cards: cardsOut, syncedAt: new Date().toISOString(), count: cardsOut.length });
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};
