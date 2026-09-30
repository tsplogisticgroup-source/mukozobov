// ====================== OZON: каталог карточек и печать этикеток ======================
// Товар Ozon ведётся отдельно от остатка WB. Карточки тянем через воркер из Ozon Seller API
// (несколько кабинетов — ключи лежат секретами в воркере), печатаем этикетки 58×40 со
// штрихкодом Ozon — по размерам или по коробам (по своей сетке артикула).
//
// Хранение (Supabase KV):
//   sklad:ozon_catalog:<кабинет> — { syncedAt, products: [{ offerId, name, barcodes, attrs }] }
//   sklad:ozon_cfg               — { cabs: { [кабинет]: { seller, groupBy } }, grids: { [кабинет]: { [артикул]: { [offer_id размера]: шт. в коробе } } } }
import React, { useState, useEffect, useMemo } from 'react';

const KEY_OZON_CFG = 'sklad:ozon_cfg';
const keyCatalog = cab => 'sklad:ozon_catalog:' + cab;
const kvGet = async k => { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; };
const kvSet = (k, v) => window.storage.set(k, JSON.stringify(v));
const sortSizes = (a, b) => (parseFloat(String(a).replace(',', '.')) || 0) - (parseFloat(String(b).replace(',', '.')) || 0) || String(a).localeCompare(String(b));

async function ozonCall(path) {
  const base = window.WB_PROXY_URL;
  if (!base) throw new Error('Не задан адрес воркера (WB_PROXY_URL).');
  const res = await fetch(base + path);
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }
  if (!res.ok) throw new Error(data.error || data.message || data.raw || `HTTP ${res.status}`);
  return data;
}

const attr = (p, re) => { const k = Object.keys(p.attrs || {}).find(n => re.test(n)); return k ? String(p.attrs[k]).trim() : ''; };
// Из карточки Ozon (одна карточка = один размер) получаем: размер, бренд, цвет и артикул-группу.
// Группировка: auto — артикул продавца без размерного хвоста («105-3-36» → «105-3»), иначе атрибут
// «Артикул», иначе «Название модели» + цвет; остальные режимы — принудительно.
export function deriveOzonProduct(p, groupBy) {
  const offer = String(p.offerId || '').trim();
  const brand = attr(p, /^бренд/i);
  const color = attr(p, /^цвет товара/i) || attr(p, /^цвет/i);
  let size = attr(p, /российский размер/i) || attr(p, /размер производителя/i) || attr(p, /^размер/i);
  const tail = offer.match(/^(.+?)[\s\-_\/.|]+(\d{2}(?:[.,]5)?)$/);
  if (!size && tail) size = tail[2];
  size = size || '—';
  let base = offer;
  const esc = size.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bySize = size !== '—' ? offer.match(new RegExp('^(.+?)[\\s\\-_\\/.|]+' + esc + '$')) : null;
  if (bySize) base = bySize[1]; else if (tail) base = tail[1];
  const art = attr(p, /^артикул/i);
  const model = attr(p, /название модели/i);
  const modelKey = model ? (color ? `${model} ${color}` : model) : '';
  let article;
  if (groupBy === 'offer') article = base;
  else if (groupBy === 'attr') article = art || base;
  else if (groupBy === 'model') article = modelKey || base;
  else article = base !== offer ? base : (art || modelKey || offer);
  return { offerId: offer, name: p.name || '', barcodes: p.barcodes || [], barcode: (p.barcodes || [])[0] || '', brand, color, size, article };
}
export function groupOzonCatalog(products, groupBy) {
  const out = {};
  (products || []).forEach(p => {
    const d = deriveOzonProduct(p, groupBy);
    if (!out[d.article]) out[d.article] = { article: d.article, brand: d.brand, color: d.color, name: d.name, sizes: [] };
    out[d.article].sizes.push(d);
  });
  Object.values(out).forEach(a => a.sizes.sort((x, y) => sortSizes(x.size, y.size)));
  return out;
}

// ── Этикетка 58×40 (тот же макет, что у этикеток WB): текст сверху, штрихкод снизу ──
export async function renderOzonLabelPNG({ name, article, size, barcode, brand, color, seller }) {
  const DPI = 300, MM = DPI / 25.4, PT = DPI / 72;
  const mm = v => Math.round(v * MM);
  const W = mm(58), H = mm(40);
  const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#000';
  const ML = mm(2.5), maxW = W - ML * 2;
  const rows = [
    { t: name || article, pt: 8, center: true },
    { t: `Артикул: ${article}`, pt: 6.5 },
    size && size !== '—' ? { t: `Размер: ${size}`, pt: 9.3 } : null,
    color ? { t: `Цвет: ${color}`, pt: 6 } : null,
    brand ? { t: `Бренд: ${brand}`, pt: 6 } : null,
    seller ? { t: seller, pt: 6 } : null,
  ].filter(Boolean);
  const T0 = mm(1.5), T1 = mm(19.5), totalH = rows.reduce((s, r) => s + r.pt * PT, 0);
  const gap = rows.length > 1 ? (T1 - T0 - totalH) / (rows.length - 1) : 0;
  let y = T0;
  for (const r of rows) {
    let pt = r.pt, text = r.t;
    ctx.font = `bold ${Math.round(pt * PT)}px Arial`;
    while (ctx.measureText(text).width > maxW && pt > 4.5) { pt -= 0.3; ctx.font = `bold ${Math.round(pt * PT)}px Arial`; }
    if (ctx.measureText(text).width > maxW) { while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1); text += '…'; }
    ctx.fillText(text, r.center ? (W - ctx.measureText(text).width) / 2 : ML, y + r.pt * PT);
    y += r.pt * PT + gap;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  window.JsBarcode(svg, barcode, { format: 'CODE128', displayValue: false, width: 2.5, height: 80, margin: 0, background: '#ffffff', lineColor: '#000000' });
  const str = new XMLSerializer().serializeToString(svg);
  document.body.removeChild(svg);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([str], { type: 'image/svg+xml' }));
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  URL.revokeObjectURL(url);
  const bcW = W - mm(8), bcH = mm(11.3);
  ctx.drawImage(img, (W - bcW) / 2, mm(25), bcW, bcH);
  ctx.font = `bold ${Math.round(5.7 * PT)}px Arial`;
  ctx.fillText(barcode, (W - ctx.measureText(barcode).width) / 2, mm(38));
  return cvs.toDataURL('image/png');
}

export function OzonTab({ Section, ArticleCombobox, icons }) {
  const { Printer, Download, Loader2, AlertTriangle, RefreshCcw, Tag } = icons;
  const [cabs, setCabs] = useState(null); // null — ещё грузим; [] — не настроено
  const [cabErr, setCabErr] = useState('');
  const [cab, setCab] = useState('');
  const [cfg, setCfg] = useState({ cabs: {}, grids: {} });
  const [catalog, setCatalog] = useState(null); // { syncedAt, products }
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [article, setArticle] = useState('');
  const [qtys, setQtys] = useState({});
  const [boxes, setBoxes] = useState(1);

  useEffect(() => { (async () => {
    try { const c = await kvGet(KEY_OZON_CFG); if (c) setCfg({ cabs: c.cabs || {}, grids: c.grids || {} }); } catch (e) { console.error(e); }
    try {
      const d = await ozonCall('/ozon/cabinets');
      const list = d.cabinets || [];
      setCabs(list);
      if (list.length) setCab(localStorage.getItem('ozon_cab') && list.find(c => c.id === localStorage.getItem('ozon_cab')) ? localStorage.getItem('ozon_cab') : list[0].id);
    } catch (e) { setCabs([]); setCabErr(String(e.message || e)); }
  })(); }, []);
  useEffect(() => {
    if (!cab) return;
    try { localStorage.setItem('ozon_cab', cab); } catch (_) {}
    setCatalog(null); setArticle(''); setQtys({}); setErr('');
    (async () => { try { setCatalog((await kvGet(keyCatalog(cab))) || { syncedAt: null, products: [] }); } catch (e) { setErr(String(e.message || e)); } })();
  }, [cab]);

  const cabCfg = cfg.cabs[cab] || {};
  const groupBy = cabCfg.groupBy || 'auto';
  const articles = useMemo(() => groupOzonCatalog(catalog ? catalog.products : [], groupBy), [catalog, groupBy]);
  const artKeys = useMemo(() => Object.keys(articles).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [articles]);
  const cur = articles[article];
  const grid = ((cfg.grids[cab] || {})[article]) || {};
  const gridSum = cur ? cur.sizes.reduce((s, z) => s + (Number(grid[z.offerId]) || 0), 0) : 0;
  const total = cur ? cur.sizes.reduce((s, z) => s + (Number(qtys[z.offerId]) || 0), 0) : 0;
  const noBarcode = catalog ? catalog.products.filter(p => !(p.barcodes || []).length).length : 0;

  async function saveCfg(next) { setCfg(next); try { await kvSet(KEY_OZON_CFG, next); } catch (e) { console.error(e); } }
  const setCabCfg = patch => saveCfg({ ...cfg, cabs: { ...cfg.cabs, [cab]: { ...cabCfg, ...patch } } });
  const setGrid = (offerId, v) => saveCfg({ ...cfg, grids: { ...cfg.grids, [cab]: { ...(cfg.grids[cab] || {}), [article]: { ...grid, [offerId]: Math.max(0, Number(v) || 0) } } } });

  async function sync() {
    setBusy('Синхронизирую с Ozon…'); setErr('');
    try {
      const d = await ozonCall('/ozon/catalog?cab=' + encodeURIComponent(cab));
      const next = { syncedAt: d.syncedAt, products: d.products || [] };
      await kvSet(keyCatalog(cab), next);
      setCatalog(next);
    } catch (e) { setErr(String(e.message || e)); }
    finally { setBusy(''); }
  }
  function exportCatalog() {
    const XLSX = window.XLSX;
    const rows = [['Артикул (группа)', 'Артикул Ozon (offer_id)', 'Размер', 'Бренд', 'Цвет', 'Штрихкод', 'Все штрихкоды', 'Название']];
    artKeys.forEach(a => articles[a].sizes.forEach(z => rows.push([a, z.offerId, z.size, z.brand, z.color, z.barcode, z.barcodes.join(', '), z.name])));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Ozon');
    XLSX.writeFile(wb, `Ozon_карточки_${(cabs.find(c => c.id === cab) || {}).name || cab}.xlsx`);
  }
  function fillByBoxes() {
    if (!cur) return;
    if (!gridSum) { alert('Сначала задай сетку короба — сколько пар каждого размера лежит в одном коробе.'); return; }
    const n = Math.max(1, Number(boxes) || 1);
    const next = {};
    cur.sizes.forEach(z => { next[z.offerId] = String((Number(grid[z.offerId]) || 0) * n); });
    setQtys(next);
  }
  async function makePdf() {
    const items = [];
    cur.sizes.forEach(z => { for (let i = 0, n = Number(qtys[z.offerId]) || 0; i < n; i++) items.push(z); });
    if (!items.length) { alert('Укажи, сколько этикеток печатать.'); return null; }
    const miss = items.find(z => !z.barcode);
    if (miss) { alert(`У ${miss.offerId} нет штрихкода в Ozon — сгенерируй его в кабинете Ozon (Товары → Штрихкоды) и синхронизируй заново.`); return null; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: [58, 40], orientation: 'landscape' });
    const cache = {};
    for (let i = 0; i < items.length; i++) {
      const z = items[i];
      if (i) doc.addPage([58, 40], 'landscape');
      if (!cache[z.offerId]) cache[z.offerId] = await renderOzonLabelPNG({ name: z.name, article: z.offerId, size: z.size, barcode: z.barcode, brand: z.brand, color: z.color, seller: cabCfg.seller || '' });
      doc.addImage(cache[z.offerId], 'PNG', 0, 0, 58, 40);
      if (i % 20 === 0) setBusy(`Готовлю этикетки… ${i + 1}/${items.length}`);
    }
    return doc;
  }
  async function print(download) {
    if (!cur) return;
    setBusy('Готовлю этикетки…');
    try {
      const doc = await makePdf();
      if (!doc) return;
      if (download) doc.save(`Ozon_${article}.pdf`);
      else { doc.autoPrint(); if (!window.open(doc.output('bloburl'), '_blank')) alert('Разреши всплывающие окна для сайта, чтобы открыть печать.'); }
    } catch (e) { console.error(e); alert('Ошибка печати: ' + (e.message || e)); }
    finally { setBusy(''); }
  }

  const soft = { fontSize: 12, color: 'var(--ink-soft)' };
  const busyRow = busy && <span style={{ ...soft, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> {busy}</span>;
  const setupHint = <div style={{ padding: '10px 14px', borderRadius: 10, border: '1px dashed var(--line)', background: 'var(--paper)', fontSize: 13 }}>
    <div style={{ fontWeight: 600, marginBottom: 6 }}>Как подключить кабинет Ozon</div>
    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.55 }}>
      <li>В кабинете Ozon Seller: <b>Настройки → Seller API → Сгенерировать ключ</b>, роль <b>«Товары» (достаточно только чтения)</b>. Запиши <span className="skl-mono">Client ID</span> и <span className="skl-mono">API key</span>.</li>
      <li>В Cloudflare открой воркер → <b>Settings → Variables and Secrets</b> и добавь секреты <span className="skl-mono">OZON1_CLIENT_ID</span> и <span className="skl-mono">OZON1_API_KEY</span>, плюс обычную переменную <span className="skl-mono">OZON1_NAME</span> — название кабинета.</li>
      <li>Второй кабинет — то же самое с цифрой 2: <span className="skl-mono">OZON2_CLIENT_ID</span>, <span className="skl-mono">OZON2_API_KEY</span>, <span className="skl-mono">OZON2_NAME</span> (до 10 кабинетов).</li>
      <li>Нажми Deploy в воркере и обнови эту страницу — кабинеты появятся здесь.</li>
    </ol>
    <div style={{ ...soft, marginTop: 6 }}>Ключи хранятся только в воркере — в браузер и в ВМС они не попадают.</div>
  </div>;

  return <React.Fragment>
    <Section title="Ozon · кабинеты и каталог" icon={<RefreshCcw size={18} />} open collapsible={false}>
      {cabs === null ? <div style={soft}>Загружаю кабинеты…</div> : !cabs.length ? <React.Fragment>
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--warn)' }}><AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {cabErr ? `Воркер не отдал список кабинетов Ozon (${cabErr}). Скорее всего, в Cloudflare ещё старая версия воркера — обнови её.` : 'Кабинеты Ozon ещё не подключены.'}</div>
        {setupHint}
      </React.Fragment> : <React.Fragment>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {cabs.map(c => <button key={c.id} className={'skl-btn ' + (c.id === cab ? 'skl-btn-primary' : 'skl-btn-ghost')} onClick={() => setCab(c.id)}>{c.name}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="skl-btn skl-btn-primary" disabled={!!busy} onClick={sync}><RefreshCcw size={14} /> Синхронизировать с Ozon</button>
          <button className="skl-btn skl-btn-ghost" disabled={!artKeys.length} onClick={exportCatalog}><Download size={14} /> Скачать карточки (Excel)</button>
          {catalog && catalog.syncedAt && <span style={soft}>обновлено: {new Date(catalog.syncedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · карточек {catalog.products.length} · артикулов {artKeys.length}</span>}
          {busyRow}
        </div>
        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'var(--negative-soft)', border: '1px dashed var(--negative)', fontSize: 13, color: 'var(--negative)' }}><AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{err}</div>}
        {noBarcode > 0 && <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--warn)' }}>У {noBarcode} карточек нет штрихкода в Ozon — для них этикетку напечатать нельзя, пока не сгенерируешь штрихкод в кабинете.</div>}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={soft}>Продавец на этикетке (необязательно)</span>
            <input className="skl-input" style={{ width: 260 }} placeholder="например: ИП Мукозобов Д.В." defaultValue={cabCfg.seller || ''} key={'seller' + cab}
              onBlur={e => { if ((cabCfg.seller || '') !== e.target.value.trim()) setCabCfg({ seller: e.target.value.trim() }); }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={soft}>Как собирать размеры в артикул</span>
            <select className="skl-input" style={{ width: 300 }} value={groupBy} onChange={e => { setCabCfg({ groupBy: e.target.value }); setArticle(''); setQtys({}); }}>
              <option value="auto">Авто (артикул Ozon без размера)</option>
              <option value="offer">По артикулу Ozon (offer_id) без размера</option>
              <option value="attr">По атрибуту «Артикул»</option>
              <option value="model">По «Названию модели» + цвет</option>
            </select>
          </label>
        </div>
      </React.Fragment>}
    </Section>

    {cabs && cabs.length > 0 && <Section title="Печать этикеток Ozon" icon={<Tag size={18} />} open collapsible={false}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0, marginBottom: 12 }}>
        Этикетка 58×40: название, артикул Ozon, размер, цвет, бренд и штрихкод из карточки Ozon. Печатай по размерам или по коробам — по сетке артикула.
      </p>
      {!artKeys.length ? <div style={soft}>Каталог пуст — нажми «Синхронизировать с Ozon».</div> : <React.Fragment>
        <ArticleCombobox value={article} onChange={v => { setArticle(v); setQtys({}); }} options={artKeys}
          names={Object.fromEntries(artKeys.map(a => [a, [articles[a].brand, articles[a].name].filter(Boolean).join(' · ')]))} placeholder="Начни вводить артикул или название…" />
        {cur && <div style={{ marginTop: 14 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 12 }}>
            <thead><tr style={{ color: 'var(--ink-soft)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>Размер</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>Артикул Ozon</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>Штрихкод</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>В коробе, шт.</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>Печатать, шт.</th>
            </tr></thead>
            <tbody>{cur.sizes.map(z => <tr key={z.offerId} style={{ borderTop: '1px solid var(--line)' }}>
              <td style={{ padding: '6px 8px', fontWeight: 600 }}>{z.size}</td>
              <td style={{ padding: '6px 8px' }} className="skl-mono">{z.offerId}</td>
              <td style={{ padding: '6px 8px', color: z.barcode ? undefined : 'var(--negative)' }} className="skl-mono">{z.barcode || 'нет штрихкода'}{z.barcodes.length > 1 && <span style={soft}> +{z.barcodes.length - 1}</span>}</td>
              <td style={{ padding: '6px 8px' }}><input className="skl-input" type="number" min="0" style={{ width: 70 }} placeholder="0" value={grid[z.offerId] || ''} onChange={e => setGrid(z.offerId, e.target.value)} /></td>
              <td style={{ padding: '6px 8px' }}><input className="skl-input" type="number" min="0" style={{ width: 80 }} placeholder="0" value={qtys[z.offerId] || ''} onChange={e => setQtys(prev => ({ ...prev, [z.offerId]: e.target.value }))} /></td>
            </tr>)}</tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={soft}>По коробам ({gridSum ? `в коробе ${gridSum} шт.` : 'сетка не задана'}):</span>
            <input className="skl-input" type="number" min="1" style={{ width: 70 }} value={boxes} onChange={e => setBoxes(e.target.value)} />
            <button className="skl-btn skl-btn-ghost" onClick={fillByBoxes}>Заполнить по коробам</button>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="skl-btn skl-btn-primary" disabled={!total || !!busy} onClick={() => print(false)}><Printer size={14} /> Печать {total} шт.</button>
            <button className="skl-btn skl-btn-ghost" disabled={!total || !!busy} onClick={() => print(true)}><Download size={14} /> Скачать PDF</button>
            {busyRow}
          </div>
        </div>}
      </React.Fragment>}
    </Section>}
  </React.Fragment>;
}
