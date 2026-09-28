// ====================== ЧЕСТНЫЙ ЗНАК: остаток кизов, печать, журнал ======================
// Кизы (коды маркировки) загружаются файлом из ЛК Честного Знака (xlsx/csv), ложатся на
// остаток по артикулу и размеру, печатаются этикеткой 58×40 (наша этикетка + DataMatrix)
// по коробам или по размерам, списываются при печати и могут быть возвращены в остаток.
//
// Хранение (Supabase KV):
//   sklad:kiz_index        — сводка: { [артикул]: { brand, sizes: { [размер]: { gtin, free, printed } }, updatedAt } }
//   sklad:kiz:<артикул>    — свободные коды: { sizes: { [размер]: { gtin, codes: [полный код с GS] } }, used: [ключ31…] }
//   sklad:kiz_jobs         — журнал печати (новые сверху): [{ id, at, article, brand, count, returned, bySize }]
//   sklad:kiz_job:<id>     — состав печати: { items: [{ size, gtin, barcode, code, returned }] }
import React, { useState, useEffect, useMemo } from 'react';

export const KEY_KIZ_INDEX = 'sklad:kiz_index';
const KEY_KIZ_JOBS = 'sklad:kiz_jobs';
const keyArt = a => 'sklad:kiz:' + a;
const keyJob = id => 'sklad:kiz_job:' + id;
const GS = '\u001d';
const BOX_SIZE = 8;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const sortSizes = (a, b) => (Number(a) || 0) - (Number(b) || 0) || String(a).localeCompare(String(b));
const fmtAt = iso => { const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); };

// Разбор кода маркировки. Принимает как есть со сканера или из файла:
// с GS-разделителями (\u001d), с текстом «\u001d», со скобками «(01)…(21)…», с префиксом «]d2».
// Структура для обуви: 01 + GTIN(14) + 21 + серийный(13) [GS 91 + 4 симв. GS 92 + криптохвост].
// Возвращает { gtin, serial, key (31 символ — уникальность), full (без GS), wb (с GS — для WB и DataMatrix) }.
export function parseKizCode(raw) {
  let s = String(raw || '').replace(/\\u001[dD]/g, GS).trim();
  if (/^\][A-Za-z]\d/.test(s)) s = s.slice(3);
  if (/^\(01\)/.test(s)) s = s.replace(/\((01|21|91|92)\)/g, '$1');
  const noGs = s.replace(/\u001d/g, '');
  if (!/^01\d{14}21/.test(noGs) || noGs.length < 31) return null;
  const key = noGs.slice(0, 31);
  const rest = noGs.slice(31);
  let wb = key;
  const m = rest.match(/^[^A-Za-z0-9]?91(.{4})(?:[^A-Za-z0-9]?92(.*))?$/s);
  if (rest && m) wb = key + GS + '91' + m[1] + (m[2] != null ? GS + '92' + m[2] : '');
  else if (rest) wb = key + GS + rest.replace(/^[^A-Za-z0-9]/, '');
  return { gtin: noGs.slice(2, 16), serial: noGs.slice(18, 31), key, full: noGs, wb };
}

// GTIN-14 «0466…» ↔ баркод EAN-13 «466…» (для сверки с карточкой WB).
export const gtinToEan = g => String(g || '').replace(/^0/, '');

const kvGet = async k => { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; };
const kvSet = (k, v) => window.storage.set(k, JSON.stringify(v));

// ── Разбор файла из ЛК Честного Знака ───────────────────────────────────────────
// Ищем строку заголовков и колонки: код (полный с GS предпочтительнее), артикул, размер,
// бренд, GTIN. Если колонок артикул/размер нет — строки помечаются и размер берётся по GTIN
// из уже загруженных кизов (index).
export function parseKizFile(buf, { canonArticle, index }) {
  const XLSX = window.XLSX;
  const wb = XLSX.read(buf, { type: 'array', raw: true });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true });
  let hdrIdx = rows.findIndex(r => r.some(c => /gtin|код идентификации|^ки$|артикул/i.test(String(c))));
  const hdr = hdrIdx >= 0 ? rows[hdrIdx].map(c => String(c).toLowerCase()) : [];
  const body = rows.slice(hdrIdx + 1).filter(r => r.some(c => String(c).trim() !== ''));
  const findCol = re => hdr.findIndex(h => re.test(h));
  // Колонка с кодом: та, где встречается GS (полный код), иначе — где коды разбираются.
  const sample = body.slice(0, 50);
  const width = Math.max(...sample.map(r => r.length), 0);
  let codeCol = -1;
  for (let c = 0; c < width && codeCol < 0; c++) if (sample.some(r => String(r[c]).includes(GS) || /\\u001d/i.test(String(r[c])))) codeCol = c;
  if (codeCol < 0) for (let c = 0; c < width && codeCol < 0; c++) if (sample.filter(r => parseKizCode(r[c])).length >= Math.max(1, sample.length * 0.6)) codeCol = c;
  if (codeCol < 0) throw new Error('Не нашёл колонку с кодами маркировки (01…21…). Проверь файл.');
  const artCol = findCol(/артикул/), sizeCol = findCol(/размер/), brandCol = findCol(/товарный знак|бренд/), gtinCol = findCol(/^gtin/), nameCol = findCol(/наименование/);
  const gtinOwner = {}; // GTIN → { article, size } из уже загруженного остатка
  Object.entries(index || {}).forEach(([a, v]) => Object.entries(v.sizes || {}).forEach(([s, x]) => { if (x.gtin) gtinOwner[x.gtin] = { article: a, size: s }; }));
  const out = [], errors = [];
  body.forEach((r, i) => {
    const k = parseKizCode(r[codeCol]);
    const rowNo = hdrIdx + 2 + i;
    if (!k) { errors.push({ row: rowNo, reason: 'код не разбирается', value: String(r[codeCol]).slice(0, 40) }); return; }
    if (gtinCol >= 0 && String(r[gtinCol]).trim() && String(r[gtinCol]).trim().padStart(14, '0') !== k.gtin) { errors.push({ row: rowNo, reason: 'GTIN в колонке не совпадает с GTIN в коде', value: k.key }); return; }
    let article = artCol >= 0 ? canonArticle(String(r[artCol]).trim()) : '';
    let size = sizeCol >= 0 ? String(r[sizeCol]).trim() : '';
    if (!article || !size) {
      const o = gtinOwner[k.gtin];
      if (o) { article = article || o.article; size = size || o.size; }
    }
    if (!article || !size) { errors.push({ row: rowNo, reason: 'нет артикула/размера и GTIN ещё не известен', value: k.gtin }); return; }
    if (!k.wb.includes(GS)) errors.push({ row: rowNo, reason: 'код без криптохвоста (91/92) — WB может не принять', value: k.key, warn: true });
    out.push({ code: k.wb, key: k.key, gtin: k.gtin, article, size, brand: brandCol >= 0 ? String(r[brandCol]).trim() : '', name: nameCol >= 0 ? String(r[nameCol]).trim() : '' });
  });
  return { rows: out, errors, codeHasGs: sample.some(r => String(r[codeCol]).includes(GS)) };
}

// ── Этикетка 58×40: наша этикетка + DataMatrix Честного Знака ───────────────────
let bwipMod = null;
async function bwip() {
  if (!bwipMod) { const m = await import('bwip-js'); bwipMod = m.toCanvas ? m : m.default; }
  return bwipMod;
}
export async function renderKizLabelPNG({ name, article, size, barcode, brand, code }) {
  const DPI = 300, LW_mm = 58, LH_mm = 40, MM = DPI / 25.4, PT = DPI / 72;
  const mm = v => Math.round(v * MM);
  const W = mm(LW_mm), H = mm(LH_mm);
  const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#000';
  // DataMatrix справа сверху (GS1: FNC1 в начале и как разделитель групп).
  const DM = mm(17), DMX = W - mm(2) - DM, DMY = mm(1.5);
  const lib = await bwip();
  const dm = document.createElement('canvas');
  lib.toCanvas(dm, { bcid: 'datamatrix', text: '^FNC1' + code.replace(/\u001d/g, '^FNC1'), parsefnc: true, scale: 6, padding: 0 });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(dm, DMX, DMY, DM, DM);
  ctx.imageSmoothingEnabled = true;
  ctx.font = `${Math.round(4.2 * PT)}px Arial`; ctx.textAlign = 'center';
  ctx.fillText('Честный знак', DMX + DM / 2, DMY + DM + mm(2.2));
  ctx.textAlign = 'left';
  // Текст слева, в колонке до DataMatrix.
  const ML = mm(2.5), maxW = DMX - mm(2) - ML;
  const rows = [
    { t: name || article, pt: 7.5, center: false },
    { t: `Артикул: ${article}`, pt: 6.5 },
    { t: `Размер: ${size}`, pt: 9.3 },
    brand ? { t: `Бренд: ${brand}`, pt: 6 } : null,
    { t: 'ИП: Мукозобов Д.В.', pt: 6 },
  ].filter(Boolean);
  const T0 = mm(1.5), T1 = mm(21.5), totalH = rows.reduce((s, r) => s + r.pt * PT, 0);
  const gap = rows.length > 1 ? (T1 - T0 - totalH) / (rows.length - 1) : 0;
  let y = T0;
  for (const r of rows) {
    let pt = r.pt, text = r.t;
    ctx.font = `bold ${Math.round(pt * PT)}px Arial`;
    while (ctx.measureText(text).width > maxW && pt > 4.5) { pt -= 0.3; ctx.font = `bold ${Math.round(pt * PT)}px Arial`; }
    if (ctx.measureText(text).width > maxW) { while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1); text += '…'; }
    ctx.fillText(text, ML, y + r.pt * PT);
    y += r.pt * PT + gap;
  }
  // Штрихкод WB снизу (если баркод известен), иначе — GTIN текстом.
  if (barcode) {
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
    ctx.font = `bold ${Math.round(5.7 * PT)}px Arial`; ctx.textAlign = 'center';
    ctx.fillText(barcode, W / 2, mm(38));
  } else {
    ctx.font = `bold ${Math.round(6 * PT)}px Arial`; ctx.textAlign = 'center';
    ctx.fillText(`GTIN ${code.slice(2, 16)}`, W / 2, mm(32));
  }
  return cvs.toDataURL('image/png');
}

async function makeLabelsPdf(items, onProgress) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: [58, 40], orientation: 'landscape' });
  for (let i = 0; i < items.length; i++) {
    if (i) doc.addPage([58, 40], 'landscape');
    doc.addImage(await renderKizLabelPNG(items[i]), 'PNG', 0, 0, 58, 40);
    if (onProgress && i % 10 === 0) onProgress(`Готовлю этикетки… ${i + 1}/${items.length}`);
  }
  return doc;
}
// Шаблон файла с кизами (xlsx): те же колонки, что понимает разбор, + строки-примеры.
export function downloadKizTemplate() {
  const XLSX = window.XLSX;
  const rows = [
    ['Артикул', 'Размер', 'Бренд', 'GTIN', 'Код маркировки (полный, с разделителями)'],
    ['105-3', '36', 'LOFERS', '04660777484265', '0104660777484265215uNkPO=-6bFsz' + GS + '9180C5' + GS + '924FaAejoa6cfk0aZolJBLWm2FP6r7/XYazmFsVGp3QCRLj0YSTj9Kg/zPXjIKVBsdy/GoubPxVaFtS3V8Xn7rlA=='],
    ['105-3', '37', 'LOFERS', '04660777484272', '0104660777484272215eZ4NjNigRoGP' + GS + '9180C5' + GS + '92RxrStqN6Kt+2CTJ2888HfuVDQeA2NHj9pRdMpZbf6EQ9+scmYDOgUbr2Dkl9UZhulglGhCG/yyBTRfXk4rWW1Q=='],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 16 }, { wch: 120 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Кизы');
  XLSX.writeFile(wb, 'Шаблон_кизы_ЧЗ.xlsx');
}
function openPrint(doc) {
  doc.autoPrint();
  const w = window.open(doc.output('bloburl'), '_blank');
  if (!w) alert('Разреши всплывающие окна для сайта, чтобы открыть печать.');
}

// ── Компонент вкладки ────────────────────────────────────────────────────────────
export function KizTab({ Section, ArticleCombobox, icons, labelArticles, gridVector, learnGtinMany, canonArticle }) {
  const { Printer, Upload, Download, Trash2, Loader2, AlertTriangle, RefreshCcw } = icons;
  const [index, setIndex] = useState({});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [preview, setPreview] = useState(null); // { fileName, rows, errors, byArticle: [...] }
  const [search, setSearch] = useState('');
  const [printArt, setPrintArt] = useState('');
  const [qtys, setQtys] = useState({});
  const [boxes, setBoxes] = useState(1);
  const [retJob, setRetJob] = useState(null); // { job, items, checked: Set }

  useEffect(() => { (async () => {
    try { setIndex((await kvGet(KEY_KIZ_INDEX)) || {}); } catch (e) { console.error(e); }
    try { const j = await kvGet(KEY_KIZ_JOBS); setJobs(Array.isArray(j) ? j : []); } catch (e) { console.error(e); }
    setLoading(false);
  })(); }, []);

  // Карточка WB для артикула (учитывая бренд из ЧЗ) — имя и баркоды по размерам.
  function wbCard(article, brand) {
    const entries = Object.entries(labelArticles || {}).filter(([, v]) => v.code === article);
    if (!entries.length) return null;
    const b = String(brand || '').toLowerCase();
    const hit = entries.find(([, v]) => b && String(v.brand || '').toLowerCase() === b) || entries[0];
    return { key: hit[0], ...hit[1] };
  }
  const barcodeFor = (card, size) => { const s = card && card.sizes.find(x => String(x.size) === String(size)); return s ? s.barcode : ''; };

  // ── Загрузка файла ──
  async function handleFile(e) {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    setBusy('Читаю файл…');
    try {
      const buf = await file.arrayBuffer();
      const { rows, errors } = parseKizFile(buf, { canonArticle, index });
      // Сверяем с уже загруженными кизами каждого артикула (дубли, GTIN размера).
      const byArt = {};
      rows.forEach(r => { (byArt[r.article] = byArt[r.article] || []).push(r); });
      const plan = [];
      for (const [article, list] of Object.entries(byArt)) {
        setBusy(`Проверяю ${article}…`);
        const store = (await kvGet(keyArt(article))) || { sizes: {}, used: [] };
        const known = new Set(store.used || []);
        Object.values(store.sizes).forEach(s => s.codes.forEach(c => known.add(c.slice(0, 31))));
        const seen = new Set();
        const sizes = {}; let dup = 0, bad = 0;
        const card = wbCard(article, list[0].brand);
        list.forEach(r => {
          if (known.has(r.key) || seen.has(r.key)) { dup++; return; }
          const cur = store.sizes[r.size] && store.sizes[r.size].gtin;
          if (cur && cur !== r.gtin) { bad++; errors.push({ row: '', reason: `${article} р.${r.size}: другой GTIN (${r.gtin}), на остатке ${cur}`, value: r.key }); return; }
          seen.add(r.key);
          if (!sizes[r.size]) sizes[r.size] = { gtin: r.gtin, codes: [], barcode: barcodeFor(card, r.size) };
          if (sizes[r.size].gtin !== r.gtin) { bad++; errors.push({ row: '', reason: `${article} р.${r.size}: в файле два разных GTIN`, value: r.key }); return; }
          sizes[r.size].codes.push(r.code);
        });
        plan.push({ article, brand: list[0].brand, name: list[0].name, sizes, dup, bad, inCatalog: !!card,
          total: Object.values(sizes).reduce((s, x) => s + x.codes.length, 0) });
      }
      plan.sort((a, b) => a.article.localeCompare(b.article, undefined, { numeric: true }));
      setPreview({ fileName: file.name, plan, errors, total: plan.reduce((s, p) => s + p.total, 0) });
    } catch (err) {
      console.error(err);
      alert('Не получилось прочитать файл: ' + (err.message || err));
    } finally { setBusy(''); }
  }
  async function confirmImport() {
    if (!preview) return;
    setBusy('Записываю…');
    try {
      const idx = { ...index };
      const gtinPairs = []; // баркод WB → GTIN: станция FBS будет ловить пересорт по Честному Знаку
      for (const p of preview.plan) {
        if (!p.total) continue;
        setBusy(`Записываю ${p.article}…`);
        const store = (await kvGet(keyArt(p.article))) || { sizes: {}, used: [] };
        Object.entries(p.sizes).forEach(([size, s]) => {
          if (!store.sizes[size]) store.sizes[size] = { gtin: s.gtin, codes: [] };
          store.sizes[size].codes.push(...s.codes);
          if (s.barcode) gtinPairs.push([s.barcode, s.gtin]);
        });
        await kvSet(keyArt(p.article), store);
        idx[p.article] = indexEntry(p.article, store, { ...(idx[p.article] || {}), brand: p.brand || (idx[p.article] || {}).brand || '' });
      }
      await kvSet(KEY_KIZ_INDEX, idx);
      setIndex(idx);
      if (learnGtinMany && gtinPairs.length) await learnGtinMany(gtinPairs);
      alert(`Готово: записано ${preview.total} кизов на остаток.`);
      setPreview(null);
    } catch (err) { console.error(err); alert('Ошибка записи: ' + (err.message || err)); }
    finally { setBusy(''); }
  }
  function indexEntry(article, store, prev) {
    const sizes = {};
    Object.entries(store.sizes).forEach(([size, s]) => {
      const printed = (prev.sizes && prev.sizes[size] && prev.sizes[size].printed) || 0;
      sizes[size] = { gtin: s.gtin, free: s.codes.length, printed };
    });
    return { ...prev, sizes, updatedAt: new Date().toISOString() };
  }

  // ── Печать ──
  const printEntry = index[printArt];
  const printCard = printEntry ? wbCard(printArt, printEntry.brand) : null;
  const printSizes = printEntry ? Object.keys(printEntry.sizes).sort(sortSizes) : [];
  const needTotal = printSizes.reduce((s, z) => s + (Number(qtys[z]) || 0), 0);
  function fillByBoxes() {
    if (!printEntry) return;
    const n = Math.max(1, Number(boxes) || 1);
    const gv = printCard ? gridVector(printCard.key) : null;
    const next = {};
    if (gv) {
      printSizes.forEach(z => { next[z] = String((gv[z] || 0) * n); });
    } else {
      // Сетки нет — раскладываем 8 пар пропорционально свободным кизам.
      const free = printSizes.map(z => printEntry.sizes[z].free);
      const tot = free.reduce((a, b) => a + b, 0);
      if (!tot) return;
      const raw = free.map(f => f / tot * BOX_SIZE), res = raw.map(Math.floor);
      const order = raw.map((x, i) => ({ i, f: x - Math.floor(x) })).sort((a, b) => b.f - a.f);
      for (let g = 0; res.reduce((a, b) => a + b, 0) < BOX_SIZE && g < 100; g++) res[order[g % order.length].i]++;
      printSizes.forEach((z, i) => { next[z] = String(res[i] * n); });
    }
    setQtys(next);
  }
  async function doPrint() {
    if (!printEntry || !needTotal) { alert('Укажи, сколько этикеток печатать по размерам.'); return; }
    const short = printSizes.filter(z => (Number(qtys[z]) || 0) > printEntry.sizes[z].free);
    if (short.length) { alert('Не хватает кизов: ' + short.map(z => `р.${z} — нужно ${qtys[z]}, свободно ${printEntry.sizes[z].free}`).join('; ')); return; }
    setBusy('Готовлю печать…');
    try {
      const store = await kvGet(keyArt(printArt));
      if (!store) throw new Error('Остаток кизов не найден — обнови страницу.');
      const items = [];
      const bySize = {};
      printSizes.forEach(z => {
        const n = Number(qtys[z]) || 0;
        if (!n) return;
        const s = store.sizes[z];
        if (!s || s.codes.length < n) throw new Error(`р.${z}: свободно ${s ? s.codes.length : 0}, нужно ${n}`);
        const taken = s.codes.splice(0, n);
        store.used = [...(store.used || []), ...taken.map(c => c.slice(0, 31))];
        bySize[z] = n;
        taken.forEach(code => items.push({ size: z, gtin: s.gtin, barcode: barcodeFor(printCard, z), code, name: printCard ? printCard.name : '', article: printArt, brand: printEntry.brand || (printCard ? printCard.brand : '') }));
      });
      const doc = await makeLabelsPdf(items, setBusy);
      setBusy('Списываю кизы…');
      const job = { id: uid(), at: new Date().toISOString(), article: printArt, brand: items[0].brand, count: items.length, returned: 0, bySize };
      await kvSet(keyJob(job.id), { ...job, items: items.map(({ size, gtin, barcode, code }) => ({ size, gtin, barcode, code })) });
      await kvSet(keyArt(printArt), store);
      const idx = { ...index, [printArt]: indexEntry(printArt, store, index[printArt]) };
      Object.entries(bySize).forEach(([z, n]) => { idx[printArt].sizes[z].printed += n; });
      await kvSet(KEY_KIZ_INDEX, idx);
      const nj = [job, ...jobs].slice(0, 500);
      await kvSet(KEY_KIZ_JOBS, nj);
      setIndex(idx); setJobs(nj); setQtys({});
      openPrint(doc);
    } catch (err) { console.error(err); alert('Ошибка печати: ' + (err.message || err)); }
    finally { setBusy(''); }
  }
  async function reprint(job) {
    setBusy('Готовлю перепечатку…');
    try {
      const d = await kvGet(keyJob(job.id));
      const card = wbCard(job.article, job.brand);
      const items = (d ? d.items : []).filter(it => !it.returned).map(it => ({ ...it, article: job.article, brand: job.brand, name: card ? card.name : '' }));
      if (!items.length) { alert('В этой печати не осталось кизов (все возвращены).'); return; }
      openPrint(await makeLabelsPdf(items, setBusy));
    } catch (err) { console.error(err); alert('Ошибка: ' + (err.message || err)); }
    finally { setBusy(''); }
  }
  async function openReturn(job) {
    setBusy('Загружаю…');
    try {
      const d = await kvGet(keyJob(job.id));
      setRetJob({ job, items: d ? d.items : [], checked: new Set() });
    } catch (err) { alert('Ошибка: ' + (err.message || err)); }
    finally { setBusy(''); }
  }
  async function doReturn() {
    if (!retJob || !retJob.checked.size) return;
    const { job, items, checked } = retJob;
    setBusy('Возвращаю в остаток…');
    try {
      const store = (await kvGet(keyArt(job.article))) || { sizes: {}, used: [] };
      const back = [];
      items.forEach((it, i) => {
        if (!checked.has(i) || it.returned) return;
        it.returned = true;
        if (!store.sizes[it.size]) store.sizes[it.size] = { gtin: it.gtin, codes: [] };
        store.sizes[it.size].codes.unshift(it.code);
        back.push(it);
      });
      const keys = new Set(back.map(it => it.code.slice(0, 31)));
      store.used = (store.used || []).filter(k => !keys.has(k));
      await kvSet(keyArt(job.article), store);
      await kvSet(keyJob(job.id), { ...job, items });
      const idx = { ...index, [job.article]: indexEntry(job.article, store, index[job.article] || { brand: job.brand }) };
      back.forEach(it => { const s = idx[job.article].sizes[it.size]; if (s) s.printed = Math.max(0, s.printed - 1); });
      await kvSet(KEY_KIZ_INDEX, idx);
      const nj = jobs.map(j => j.id === job.id ? { ...j, returned: (j.returned || 0) + back.length } : j);
      await kvSet(KEY_KIZ_JOBS, nj);
      setIndex(idx); setJobs(nj); setRetJob(null);
      alert(`Возвращено в остаток: ${back.length} шт.`);
    } catch (err) { console.error(err); alert('Ошибка: ' + (err.message || err)); }
    finally { setBusy(''); }
  }
  async function deleteArticle(article) {
    const e = index[article]; if (!e) return;
    const free = Object.values(e.sizes).reduce((s, x) => s + x.free, 0);
    if (!window.confirm(`Удалить ВСЕ свободные кизы артикула ${article} (${free} шт.)? Это необратимо — при повторной загрузке файла напечатанные ранее коды не будут распознаны как дубли.`)) return;
    setBusy('Удаляю…');
    try {
      await window.storage.delete(keyArt(article));
      const idx = { ...index }; delete idx[article];
      await kvSet(KEY_KIZ_INDEX, idx); setIndex(idx);
      if (printArt === article) setPrintArt('');
    } catch (err) { alert('Ошибка: ' + (err.message || err)); }
    finally { setBusy(''); }
  }

  // ── Рендер ──
  const arts = Object.keys(index).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const q = search.trim().toLowerCase();
  const shown = q ? arts.filter(a => a.toLowerCase().includes(q) || String(index[a].brand || '').toLowerCase().includes(q)) : arts;
  const totalFree = arts.reduce((s, a) => s + Object.values(index[a].sizes).reduce((t, x) => t + x.free, 0), 0);
  const th = { padding: '6px 8px', fontWeight: 500, textAlign: 'left' };
  const td = { padding: '6px 8px' };
  const soft = { fontSize: 12, color: 'var(--ink-soft)' };
  const busyRow = busy && <span style={{ ...soft, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> {busy}</span>;

  return <React.Fragment>
    <Section title="Загрузка кизов" icon={<Upload size={18} />} open collapsible={false}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0, marginBottom: 12 }}>
        Загрузи выгрузку из личного кабинета Честного Знака (xlsx или csv): артикул, размер и GTIN берутся из файла,
        коды ложатся на остаток по артикулу и размеру. Дубли и уже напечатанные коды отбрасываются автоматически.
      </p>
      <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, border: '1px dashed var(--line)', background: 'var(--paper)', fontSize: 13 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Как передать файл с кизами</div>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.55 }}>
          <li><b>Проще всего</b> — выгрузка кодов из Честного Знака как есть (файл вида «… ALL.xlsx»): в ней уже есть
            «КИ (код идентификации)», полный код с разделителями, «GTIN», «Модель / артикул производителя»,
            «Размер в штихмассовой системе», «Товарный знак». Ничего править не нужно.</li>
          <li><b>Или по шаблону</b> — скачай его ниже и заполни: <span className="skl-mono">Артикул · Размер · Бренд · GTIN · Код маркировки</span>.
            Одна строка = один код. Строки-примеры из шаблона удали.</li>
          <li><b>Артикул</b> пиши так же, как он записан в ВМС (например <span className="skl-mono">105-3</span>), <b>размер</b> — цифрами (<span className="skl-mono">36</span>). Без размера код не примется.</li>
          <li><b>Код маркировки</b> — полный, как выдаёт Честный Знак: <span className="skl-mono">01…21…</span> + криптохвост <span className="skl-mono">91… 92…</span>.
            Разделители GS (невидимый символ; в Excel бывает виден как квадратик) сохраняй — если они потерялись, ВМС восстановит их сама.</li>
          <li>Названия колонок можно писать по-своему — ВМС ищет их по смыслу («артикул», «размер», «gtin», «бренд»/«товарный знак»), а колонку с кодами находит по содержимому.</li>
        </ol>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="skl-btn skl-btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={14} /> Загрузить файл с кизами
          <input type="file" accept=".xlsx,.xls,.csv,.txt" style={{ display: 'none' }} onChange={handleFile} />
        </label>
        <button className="skl-btn skl-btn-ghost" onClick={downloadKizTemplate}><Download size={14} /> Скачать шаблон (xlsx)</button>
        {busyRow}
      </div>
      {preview && <div style={{ marginTop: 14, padding: 12, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{preview.fileName}: к записи {preview.total} кизов, артикулов {preview.plan.filter(p => p.total).length}</div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}>
            <th style={th}>Артикул</th><th style={th}>Бренд</th><th style={th}>Размеры (новых)</th><th style={{ ...th, textAlign: 'right' }}>Новых</th><th style={{ ...th, textAlign: 'right' }}>Уже есть</th><th style={{ ...th, textAlign: 'right' }}>Отклонено</th><th style={th}></th>
          </tr></thead>
          <tbody>{preview.plan.map(p => <tr key={p.article} style={{ borderTop: '1px solid var(--line)' }}>
            <td style={{ ...td, fontWeight: 600 }}>{p.article}</td>
            <td style={td}>{p.brand || '—'}</td>
            <td style={{ ...td, fontSize: 12 }} className="skl-mono">{Object.keys(p.sizes).sort(sortSizes).map(z => `${z}×${p.sizes[z].codes.length}`).join(', ') || '—'}</td>
            <td style={{ ...td, textAlign: 'right', fontWeight: 600 }} className="skl-mono">{p.total}</td>
            <td style={{ ...td, textAlign: 'right', color: 'var(--ink-soft)' }} className="skl-mono">{p.dup || ''}</td>
            <td style={{ ...td, textAlign: 'right', color: p.bad ? 'var(--negative)' : 'var(--ink-soft)' }} className="skl-mono">{p.bad || ''}</td>
            <td style={{ ...td, fontSize: 12, color: 'var(--warn)' }}>{!p.inCatalog && 'нет в каталоге WB — этикетка без EAN'}
              {p.inCatalog && Object.keys(p.sizes).some(z => !p.sizes[z].barcode) && 'у части размеров нет баркода WB'}</td>
          </tr>)}</tbody>
        </table>
        {preview.errors.length > 0 && <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 10, maxHeight: 140, overflow: 'auto' }}>
          <AlertTriangle size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Проблемных строк: {preview.errors.length}
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{preview.errors.slice(0, 30).map((e, i) => <li key={i} style={{ color: e.warn ? 'var(--warn)' : 'var(--negative)' }}>{e.row ? `строка ${e.row}: ` : ''}{e.reason} <span className="skl-mono">{e.value}</span></li>)}
            {preview.errors.length > 30 && <li>… и ещё {preview.errors.length - 30}</li>}</ul>
        </div>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="skl-btn skl-btn-primary" disabled={!preview.total || !!busy} onClick={confirmImport}>Записать на остаток ({preview.total})</button>
          <button className="skl-btn skl-btn-ghost" disabled={!!busy} onClick={() => setPreview(null)}>Отмена</button>
        </div>
      </div>}
    </Section>

    <Section title={`Остаток кизов${totalFree ? ` · свободно ${totalFree}` : ''}`} icon={<RefreshCcw size={18} />} open collapsible={false}>
      {loading ? <div style={soft}>Загружаю…</div> : !arts.length ? <div style={soft}>Кизов пока нет — загрузи файл выше.</div> : <React.Fragment>
        <input className="skl-input" placeholder="Поиск по артикулу или бренду…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320, marginBottom: 10 }} />
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead><tr style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}>
            <th style={th}>Артикул</th><th style={th}>Бренд</th><th style={th}>Свободно по размерам</th><th style={{ ...th, textAlign: 'right' }}>Свободно</th><th style={{ ...th, textAlign: 'right' }}>Напечатано</th><th style={th}></th>
          </tr></thead>
          <tbody>{shown.map(a => { const e = index[a]; const zs = Object.keys(e.sizes).sort(sortSizes);
            const free = zs.reduce((s, z) => s + e.sizes[z].free, 0), pr = zs.reduce((s, z) => s + e.sizes[z].printed, 0);
            return <tr key={a} style={{ borderTop: '1px solid var(--line)', background: printArt === a ? 'var(--paper)' : undefined }}>
              <td style={{ ...td, fontWeight: 600 }}>{a}</td>
              <td style={td}>{e.brand || '—'}</td>
              <td style={{ ...td, fontSize: 12 }} className="skl-mono">{zs.map(z => <span key={z} style={{ marginRight: 8, color: e.sizes[z].free ? undefined : 'var(--negative)' }}>{z}×{e.sizes[z].free}</span>)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 600 }} className="skl-mono">{free}</td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--ink-soft)' }} className="skl-mono">{pr}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button className="skl-btn skl-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setPrintArt(a); setQtys({}); }}><Printer size={12} /> Печать</button>{' '}
                <button className="skl-btn skl-btn-ghost" style={{ padding: '4px 8px', color: 'var(--negative)' }} title="Удалить все свободные кизы артикула" onClick={() => deleteArticle(a)}><Trash2 size={12} /></button>
              </td>
            </tr>; })}</tbody>
        </table>
      </React.Fragment>}
    </Section>

    <Section title="Печать этикеток с Честным Знаком" icon={<Printer size={18} />} open collapsible={false}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0, marginBottom: 12 }}>
        Одна этикетка 58×40 на пару: название, артикул, размер, бренд, штрихкод WB и DataMatrix Честного Знака.
        Заполни количество по размерам вручную или по коробам (8 пар по сетке из «Этикеток»). Напечатанные кизы списываются с остатка.
      </p>
      <ArticleCombobox value={printArt} onChange={v => { setPrintArt(v); setQtys({}); }} options={arts}
        names={Object.fromEntries(arts.map(a => [a, index[a].brand || '']))} placeholder="Выбери артикул с кизами…" />
      {printEntry && <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={soft}>По коробам:</span>
          <input className="skl-input" type="number" min="1" style={{ width: 70 }} value={boxes} onChange={e => setBoxes(e.target.value)} />
          <button className="skl-btn skl-btn-ghost" onClick={fillByBoxes}>Заполнить ({printCard && gridVector(printCard.key) ? 'по сетке' : 'сетки нет — по остатку кизов'})</button>
          {!printCard && <span style={{ fontSize: 12, color: 'var(--warn)' }}>Артикула нет в каталоге WB — этикетки будут без EAN-штрихкода.</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {printSizes.map(z => <div key={z} style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 96 }}>
            <div style={soft}>Размер {z} <span className="skl-mono" style={{ color: printEntry.sizes[z].free ? 'var(--positive)' : 'var(--negative)' }}>· {printEntry.sizes[z].free}</span></div>
            <input className="skl-input" type="number" min="0" max={printEntry.sizes[z].free} placeholder="0" value={qtys[z] || ''}
              style={{ borderColor: (Number(qtys[z]) || 0) > printEntry.sizes[z].free ? 'var(--negative)' : undefined }}
              onChange={e => setQtys(prev => ({ ...prev, [z]: e.target.value }))} />
          </div>)}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="skl-btn skl-btn-primary" disabled={!needTotal || !!busy} onClick={doPrint}><Printer size={14} /> Напечатать {needTotal} шт.</button>
          {busyRow}
        </div>
      </div>}
    </Section>

    <Section title="Журнал печати кизов" icon={<Printer size={18} />} open collapsible={false}>
      {!jobs.length ? <div style={soft}>Печати ещё не было.</div> : <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead><tr style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}>
          <th style={th}>Когда</th><th style={th}>Артикул</th><th style={th}>Бренд</th><th style={th}>Размеры</th><th style={{ ...th, textAlign: 'right' }}>Шт.</th><th style={{ ...th, textAlign: 'right' }}>Возвращено</th><th style={th}></th>
        </tr></thead>
        <tbody>{jobs.map(j => <tr key={j.id} style={{ borderTop: '1px solid var(--line)' }}>
          <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtAt(j.at)}</td>
          <td style={{ ...td, fontWeight: 600 }}>{j.article}</td>
          <td style={td}>{j.brand || '—'}</td>
          <td style={{ ...td, fontSize: 12 }} className="skl-mono">{Object.keys(j.bySize || {}).sort(sortSizes).map(z => `${z}×${j.bySize[z]}`).join(', ')}</td>
          <td style={{ ...td, textAlign: 'right' }} className="skl-mono">{j.count}</td>
          <td style={{ ...td, textAlign: 'right', color: j.returned ? 'var(--warn)' : 'var(--ink-soft)' }} className="skl-mono">{j.returned || ''}</td>
          <td style={{ ...td, whiteSpace: 'nowrap' }}>
            <button className="skl-btn skl-btn-ghost" style={{ padding: '4px 8px' }} disabled={!!busy} onClick={() => reprint(j)}><Printer size={12} /> Перепечатать</button>{' '}
            <button className="skl-btn skl-btn-ghost" style={{ padding: '4px 8px' }} disabled={!!busy || j.returned >= j.count} onClick={() => openReturn(j)}>Вернуть в остаток</button>
          </td>
        </tr>)}</tbody>
      </table>}
    </Section>

    {retJob && <div onClick={() => setRetJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card, #fff)', borderRadius: 12, padding: 18, width: 'min(640px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Вернуть кизы в остаток — {retJob.job.article} · {fmtAt(retJob.job.at)}</div>
        <div style={soft}>Отметь коды, которые остались лишними (не наклеены), и нажми «Вернуть». Уже возвращённые показаны серым.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="skl-btn skl-btn-ghost" onClick={() => setRetJob(r => ({ ...r, checked: new Set(r.items.map((it, i) => it.returned ? -1 : i).filter(i => i >= 0)) }))}>Отметить все</button>
          <button className="skl-btn skl-btn-ghost" onClick={() => setRetJob(r => ({ ...r, checked: new Set() }))}>Снять отметки</button>
        </div>
        <div style={{ overflow: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>{retJob.items.map((it, i) => <tr key={i} style={{ borderTop: i ? '1px solid var(--line)' : undefined, color: it.returned ? 'var(--ink-soft)' : undefined }}>
              <td style={{ ...td, width: 30 }}><input type="checkbox" disabled={!!it.returned} checked={retJob.checked.has(i)} onChange={e => setRetJob(r => { const c = new Set(r.checked); e.target.checked ? c.add(i) : c.delete(i); return { ...r, checked: c }; })} /></td>
              <td style={{ ...td, fontWeight: 600 }}>р.{it.size}</td>
              <td style={{ ...td, fontSize: 12 }} className="skl-mono">{it.code.slice(0, 31)}</td>
              <td style={{ ...td, fontSize: 12 }}>{it.returned ? 'возвращён' : ''}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="skl-btn skl-btn-primary" disabled={!retJob.checked.size || !!busy} onClick={doReturn}>Вернуть в остаток ({retJob.checked.size})</button>
          <button className="skl-btn skl-btn-ghost" onClick={() => setRetJob(null)}>Закрыть</button>
          {busyRow}
        </div>
      </div>
    </div>}
  </React.Fragment>;
}
