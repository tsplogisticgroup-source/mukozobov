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
// Полный код маркировки целиком в одном поле (для выбора разделителя CSV).
const FULL_KIZ = /^01\d{14}21.{13}(\u001d?91.{4}\u001d?92.+)?$/s;
// CSV по RFC 4180: поле в кавычках может содержать разделитель, кавычка внутри удваивается.
// Это важно: в серийном номере Честного Знака встречаются и «;», и «,», и «"».
function csvRows(text, delim) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"' && cur === '') q = true;
    else if (delim && ch === delim) { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = ''; rows.push(row); row = [];
    } else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
function parseCsvText(text) {
  text = text.replace(/^\uFEFF/, '');
  const head = text.slice(0, 60000);
  // Разделитель — тот, при котором в большинстве строк есть ≥2 поля и одно из них — код целиком.
  let best = '', bestScore = 0, total = 1;
  for (const d of [';', '\t', ',']) {
    const rows = csvRows(head, d).slice(0, 200).filter(r => r.some(c => c.trim() !== ''));
    total = Math.max(total, rows.length);
    const score = rows.filter(r => r.length >= 2 && r.some(c => FULL_KIZ.test(c.trim()))).length;
    if (score > bestScore) { best = d; bestScore = score; }
  }
  // Один столбец (только коды) — разделителя нет, строка = поле.
  return csvRows(text, bestScore >= total * 0.5 ? best : '');
}
function fileRows(buf) {
  const u8 = new Uint8Array(buf);
  const isXlsx = u8[0] === 0x50 && u8[1] === 0x4b, isXls = u8[0] === 0xd0 && u8[1] === 0xcf;
  if (isXlsx || isXls) {
    const XLSX = window.XLSX;
    const wb = XLSX.read(buf, { type: 'array', raw: true });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true });
  }
  let text = new TextDecoder('utf-8').decode(u8);
  if (text.includes('\uFFFD')) text = new TextDecoder('windows-1251').decode(u8); // CSV из Excel в кириллической кодировке
  return parseCsvText(text);
}

// ── Разбор файла с кизами ───────────────────────────────────────────────────────
// Понимает три вида файлов:
//   1) выгрузка из ЛК Честного Знака (xlsx): код, GTIN, артикул, размер, товарный знак;
//   2) шаблон: Артикул · Размер · Бренд · GTIN · Код маркировки;
//   3) CSV/xlsx «баркод WB ; код маркировки» (можно без заголовка) — артикул и размер
//      берутся из каталога WB по баркоду (barcodeMap).
// Если нет ни артикула/размера, ни баркода — размер берётся по GTIN из уже загруженных кизов.
export function parseKizFile(buf, { canonArticle, index, barcodeMap }) {
  const rows = fileRows(buf);
  const isKiz = c => !!parseKizCode(c);
  const HDR = /gtin|код идентификации|^ки$|артикул|баркод|штрихкод|^шк$|код маркировки|barcode/i;
  // Заголовок ищем только в первых строках и только там, где нет самих кодов
  // (в криптохвосте кода случайно может встретиться что угодно).
  const hdrIdx = rows.slice(0, 10).findIndex(r => !r.some(isKiz) && r.some(c => String(c).length < 60 && HDR.test(String(c).trim())));
  const hdr = hdrIdx >= 0 ? rows[hdrIdx].map(c => String(c).trim().toLowerCase()) : [];
  const body = rows.slice(hdrIdx + 1).filter(r => r.some(c => String(c).trim() !== ''));
  const findCol = re => hdr.findIndex(h => re.test(h));
  // Колонка с кодом: та, где встречается GS (полный код), иначе — где коды разбираются.
  const sample = body.slice(0, 50);
  const width = Math.max(...sample.map(r => r.length), 0);
  let codeCol = -1;
  for (let c = 0; c < width && codeCol < 0; c++) if (sample.some(r => String(r[c]).includes(GS) || /\\u001d/i.test(String(r[c])))) codeCol = c;
  if (codeCol < 0) for (let c = 0; c < width && codeCol < 0; c++) if (sample.filter(r => isKiz(r[c])).length >= Math.max(1, sample.length * 0.6)) codeCol = c;
  if (codeCol < 0) throw new Error('Не нашёл колонку с кодами маркировки (01…21…). Проверь файл.');
  const artCol = findCol(/артикул/), sizeCol = findCol(/размер/), brandCol = findCol(/товарный знак|бренд/), gtinCol = findCol(/^gtin/), nameCol = findCol(/наименование/);
  // Колонка с баркодом WB: по заголовку, иначе — где в большинстве строк 12–14 цифр.
  let bcCol = findCol(/баркод|штрихкод|^шк$|barcode|^ean/);
  if (bcCol < 0) for (let c = 0; c < width && bcCol < 0; c++) {
    if (c === codeCol || c === gtinCol) continue;
    if (sample.filter(r => /^\d{12,14}$/.test(String(r[c]).trim())).length >= Math.max(1, sample.length * 0.6)) bcCol = c;
  }
  const gtinOwner = {}; // GTIN → { article, size } из уже загруженного остатка
  Object.entries(index || {}).forEach(([a, v]) => Object.entries(v.sizes || {}).forEach(([z, x]) => { if (x.gtin) gtinOwner[x.gtin] = { article: a, size: z }; }));
  const out = [], errors = [];
  body.forEach((r, i) => {
    const k = parseKizCode(r[codeCol]);
    const rowNo = hdrIdx + 2 + i;
    if (!k) { errors.push({ row: rowNo, reason: 'код не разбирается', value: String(r[codeCol]).slice(0, 40) }); return; }
    if (gtinCol >= 0 && String(r[gtinCol]).trim() && String(r[gtinCol]).trim().padStart(14, '0') !== k.gtin) { errors.push({ row: rowNo, reason: 'GTIN в колонке не совпадает с GTIN в коде', value: k.key }); return; }
    let article = artCol >= 0 ? canonArticle(String(r[artCol]).trim()) : '';
    let size = sizeCol >= 0 ? String(r[sizeCol]).trim() : '';
    let brand = brandCol >= 0 ? String(r[brandCol]).trim() : '';
    let name = nameCol >= 0 ? String(r[nameCol]).trim() : '';
    const bc = bcCol >= 0 ? String(r[bcCol]).trim() : '';
    if ((!article || !size) && bc) {
      const o = (barcodeMap || {})[bc];
      if (!o) { errors.push({ row: rowNo, reason: `баркод ${bc} не найден в каталоге WB — синхронизируй каталог в «Этикетках»`, value: k.key }); return; }
      if (o.ambiguous) { errors.push({ row: rowNo, reason: `баркод ${bc} есть в нескольких карточках WB с разным артикулом/размером`, value: k.key }); return; }
      article = article || o.article; size = size || o.size; brand = brand || o.brand; name = name || o.name;
    }
    if (!article || !size) {
      const o = gtinOwner[k.gtin];
      if (o) { article = article || o.article; size = size || o.size; }
    }
    if (!article || !size) { errors.push({ row: rowNo, reason: 'нет артикула/размера, баркода WB, и GTIN ещё не известен', value: k.gtin }); return; }
    if (!k.wb.includes(GS)) errors.push({ row: rowNo, reason: 'код без криптохвоста (91/92) — WB может не принять', value: k.key, warn: true });
    out.push({ code: k.wb, key: k.key, gtin: k.gtin, article, size, brand, name, row: rowNo });
  });
  // Один GTIN = один артикул и размер. Если в файле GTIN «разъехался» по двум размерам
  // (ошибка в баркоде строки) или спорит с уже загруженным остатком — такие строки не берём.
  const byGtin = {};
  out.forEach(r => { const t = r.article + '\u0000' + r.size; ((byGtin[r.gtin] = byGtin[r.gtin] || {})[t] = (byGtin[r.gtin][t] || 0) + 1); });
  const rightFor = {};
  Object.entries(byGtin).forEach(([g, m]) => {
    const own = gtinOwner[g];
    rightFor[g] = own ? own.article + '\u0000' + own.size : Object.entries(m).sort((x, y) => y[1] - x[1])[0][0];
  });
  const good = out.filter(r => {
    const t = r.article + '\u0000' + r.size;
    if (t === rightFor[r.gtin]) return true;
    const [a, z] = rightFor[r.gtin].split('\u0000');
    errors.push({ row: r.row, reason: `GTIN ${r.gtin} относится к ${a} р.${z}, а строка указывает на ${r.article} р.${r.size} — пропущена`, value: r.key });
    return false;
  });
  return { rows: good, errors, codeHasGs: sample.some(r => String(r[codeCol]).includes(GS)), format: artCol >= 0 && sizeCol >= 0 ? 'columns' : bcCol >= 0 ? 'barcode' : 'gtin' };
}

// ── Этикетка 58×40: наша этикетка + DataMatrix Честного Знака ───────────────────
// Оба кода кладутся в PDF ВЕКТОРОМ (прямоугольниками), а не картинкой: принтер печатает
// их с ровными краями при любом разрешении. Размер модуля и координаты кратны точке
// термопринтера 203 dpi (0,125 мм): DataMatrix — 3 точки на модуль (0,375 мм; у Честного
// Знака минимум 0,255 мм), Code128 — 3 точки на штрих. Текст — растровый слой 600 dpi
// (кириллица), одинаковый для всех этикеток одного размера, поэтому в PDF он лежит один раз.
const LW = 58, LH = 40, DOT = 0.125;
const snap = v => Math.round(v / DOT) * DOT;
const SELLER_LINE = 'ИП: Мукозобов Д.В.';
let bwipMod = null;
async function bwip() {
  if (!bwipMod) { const m = await import('bwip-js'); bwipMod = m.toCanvas ? m : m.default; }
  return bwipMod;
}
// Матрица GS1 DataMatrix (FNC1 в начале и на месте каждого GS): массив строк из '0'/'1'.
export async function kizMatrix(code) {
  const lib = await bwip();
  const c = document.createElement('canvas');
  lib.toCanvas(c, { bcid: 'datamatrix', text: '^FNC1' + code.replace(/\u001d/g, '^FNC1'), parsefnc: true, scale: 1, padding: 0 });
  const w = c.width, h = c.height;
  const px = c.getContext('2d').getImageData(0, 0, w, h).data;
  const dark = (x, y) => { const i = (y * w + x) * 4; return px[i + 3] > 127 && px[i] < 128; };
  let step = 0; while (step < w && dark(step, 0)) step++; // верхняя строка символа — пунктир шириной в модуль
  const n = step ? w / step : 0;
  if (!step || w !== h || n !== Math.round(n)) throw new Error('DataMatrix: не удалось определить размер модуля');
  const rows = [];
  for (let y = 0; y < n; y++) {
    let r = '';
    for (let x = 0; x < n; x++) r += dark(x * step + (step >> 1), y * step + (step >> 1)) ? '1' : '0';
    rows.push(r);
  }
  // Контроль рамки: сплошные левая и нижняя стороны, пунктир сверху. Не сошлось — не печатаем.
  const ok = rows.every(r => r[0] === '1') && !rows[n - 1].includes('0') && [...rows[0]].every((b, x) => b === (x % 2 ? '0' : '1'));
  if (!ok) throw new Error('DataMatrix: рамка символа не распознана');
  return rows;
}
// Штрихи Code128 строкой из '0'/'1' (один символ = один модуль).
function code128Bits(barcode) {
  const o = {};
  window.JsBarcode(o, String(barcode), { format: 'CODE128' });
  return (o.encodings || []).map(e => e.data).join('');
}
const runs = (bits, fn) => { for (let x = 0; x < bits.length;) { if (bits[x] === '1') { let e = x; while (e < bits.length && bits[e] === '1') e++; fn(x, e - x); x = e; } else x++; } };

// Геометрия этикетки в мм: где DataMatrix, подпись кода, штрихкод и колонка текста.
function kizGeometry(item, matrix) {
  const n = matrix.length;
  const m = [0.5, 0.375].find(v => n * v <= 18.5) || Math.max(0.255, 18 / n);
  const dmSize = n * m;
  const dmX = snap(LW - 2 - dmSize), dmY = 1.5;
  const bits = item.barcode ? code128Bits(item.barcode) : '';
  // Свободные поля по 10 модулей слева и справа — требование Code128.
  const bm = bits ? ([0.5, 0.375, 0.25].find(v => (bits.length + 20) * v <= LW - 1) || (LW - 1) / (bits.length + 20)) : 0;
  const barW = bits.length * bm;
  return { n, m, dmSize, dmX, dmY, bits, bm, barW, barX: snap((LW - barW) / 2), barY: 24.5, barH: 10.5,
    textX: 2.5, textW: dmX - 1.5 - 2.5, textY0: 1.5, textY1: 22.5,
    hri: [`(01)${item.code.slice(2, 16)}`, `(21)${item.code.slice(18, 31)}`], hriY: dmY + dmSize + 1.9 };
}

// Растровый слой текста (без кодов): название (до 2 строк), артикул, размер крупно, бренд, продавец.
const textLayerCache = new Map();
function kizTextLayer(item, g) {
  const key = [item.name, item.article, item.size, item.brand, g.textW.toFixed(3), item.barcode ? 1 : 0].join('\u0000');
  if (textLayerCache.has(key)) return textLayerCache.get(key);
  const DPI = 600, MM = DPI / 25.4, PT = DPI / 72;
  const cvs = document.createElement('canvas'); cvs.width = Math.round(LW * MM); cvs.height = Math.round(LH * MM);
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cvs.width, cvs.height); ctx.fillStyle = '#000'; ctx.textBaseline = 'alphabetic';
  const maxW = g.textW * MM, font = (pt, bold) => { ctx.font = `${bold === false ? '' : 'bold '}${pt * PT}px Arial`; };
  const fit = (text, pt, min) => { font(pt); while (ctx.measureText(text).width > maxW && pt > min) { pt -= 0.25; font(pt); } return pt; };
  const clip = text => { if (ctx.measureText(text).width <= maxW) return text; while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1); return text + '…'; };
  // Название: переносим по словам максимум на 2 строки.
  const title = String(item.name || '').replace(/\s+/g, ' ').trim();
  const titlePt = 6.2; font(titlePt);
  const lines = [];
  if (title) {
    let cur = '';
    for (const w of title.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length > 2) { lines[1] = lines.slice(1).join(' '); lines.length = 2; }
  }
  const art = `Артикул: ${item.article}`, artPt = fit(art, 8.5, 5.5);
  const sizeLabel = 'Размер: ', sizePt = 9, sizeValPt = 15;
  const rows = [
    ...lines.map(t => ({ h: titlePt, draw: y => { font(titlePt); ctx.fillText(clip(t), g.textX * MM, y); } })),
    { h: artPt, draw: y => { font(artPt); ctx.fillText(clip(art), g.textX * MM, y); } },
    { h: sizeValPt * 0.78, draw: y => { font(sizePt); ctx.fillText(sizeLabel, g.textX * MM, y); const x = g.textX * MM + ctx.measureText(sizeLabel).width; font(sizeValPt); ctx.fillText(String(item.size), x, y); } },
    item.brand ? { h: 6, draw: y => { font(6); ctx.fillText(clip(`Бренд: ${item.brand}`), g.textX * MM, y); } } : null,
    { h: 6, draw: y => { font(6); ctx.fillText(clip(SELLER_LINE), g.textX * MM, y); } },
  ].filter(Boolean);
  const total = rows.reduce((s, r) => s + r.h * PT, 0);
  const gap = rows.length > 1 ? Math.min(2.2 * MM, ((g.textY1 - g.textY0) * MM - total) / (rows.length - 1)) : 0;
  let y = g.textY0 * MM;
  rows.forEach(r => { y += r.h * PT; r.draw(y); y += gap; });
  const layer = { key: 'kizText' + textLayerCache.size, png: cvs.toDataURL('image/png'), canvas: cvs };
  textLayerCache.set(key, layer);
  return layer;
}

// Одна страница PDF: слой текста + векторные DataMatrix и Code128 + подписи кодов.
async function drawKizPage(doc, item) {
  const matrix = await kizMatrix(item.code);
  const g = kizGeometry(item, matrix);
  const layer = kizTextLayer(item, g);
  doc.addImage(layer.png, 'PNG', 0, 0, LW, LH, layer.key, 'FAST');
  doc.setFillColor(0, 0, 0); doc.setTextColor(0, 0, 0);
  matrix.forEach((row, y) => runs(row, (x, len) => doc.rect(g.dmX + x * g.m, g.dmY + y * g.m, len * g.m, g.m + 0.01, 'F')));
  doc.setFont('helvetica', 'normal');
  let pt = 4.8; doc.setFontSize(pt);
  while (pt > 3 && Math.max(...g.hri.map(t => doc.getTextWidth(t))) > g.dmSize + 1) { pt -= 0.2; doc.setFontSize(pt); }
  g.hri.forEach((t, i) => doc.text(t, g.dmX + g.dmSize / 2, g.hriY + i * 1.8, { align: 'center' }));
  if (g.bits) {
    runs(g.bits, (x, len) => doc.rect(g.barX + x * g.bm, g.barY, len * g.bm, g.barH, 'F'));
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text(String(item.barcode), LW / 2, g.barY + g.barH + 2.9, { align: 'center' });
  }
}
// Та же этикетка картинкой — для образца на экране (геометрия общая с PDF).
export async function renderKizLabelPNG(item) {
  const matrix = await kizMatrix(item.code);
  const g = kizGeometry(item, matrix);
  const src = kizTextLayer(item, g).canvas, MM = src.width / LW;
  const cvs = document.createElement('canvas'); cvs.width = src.width; cvs.height = src.height;
  const ctx = cvs.getContext('2d');
  ctx.drawImage(src, 0, 0); ctx.fillStyle = '#000';
  const R = (x, y, w, h) => ctx.fillRect(Math.round(x * MM), Math.round(y * MM), Math.round((x + w) * MM) - Math.round(x * MM), Math.round((y + h) * MM) - Math.round(y * MM));
  matrix.forEach((row, y) => runs(row, (x, len) => R(g.dmX + x * g.m, g.dmY + y * g.m, len * g.m, g.m)));
  ctx.textAlign = 'center';
  let pt = 4.8; const PT = MM * 25.4 / 72;
  ctx.font = `${pt * PT}px Arial`;
  while (pt > 3 && Math.max(...g.hri.map(t => ctx.measureText(t).width)) > (g.dmSize + 1) * MM) { pt -= 0.2; ctx.font = `${pt * PT}px Arial`; }
  g.hri.forEach((t, i) => ctx.fillText(t, (g.dmX + g.dmSize / 2) * MM, (g.hriY + i * 1.8) * MM));
  if (g.bits) {
    runs(g.bits, (x, len) => R(g.barX + x * g.bm, g.barY, len * g.bm, g.barH));
    ctx.font = `bold ${7.5 * PT}px Arial`;
    ctx.fillText(String(item.barcode), LW / 2 * MM, (g.barY + g.barH + 2.9) * MM);
  }
  return cvs.toDataURL('image/png');
}

export async function makeLabelsPdf(items, onProgress) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: [LW, LH], orientation: 'landscape', compress: true });
  for (let i = 0; i < items.length; i++) {
    if (i) doc.addPage([LW, LH], 'landscape');
    await drawKizPage(doc, items[i]);
    if (onProgress && i % 25 === 0) { onProgress(`Готовлю этикетки… ${i + 1}/${items.length}`); await new Promise(r => setTimeout(r, 0)); }
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
  const [sample, setSample] = useState(''); // образец этикетки (картинка), код при этом не списывается
  const [retJob, setRetJob] = useState(null); // { job, items, checked: Set }

  useEffect(() => { (async () => {
    try { setIndex((await kvGet(KEY_KIZ_INDEX)) || {}); } catch (e) { console.error(e); }
    try { const j = await kvGet(KEY_KIZ_JOBS); setJobs(Array.isArray(j) ? j : []); } catch (e) { console.error(e); }
    setLoading(false);
  })(); }, []);

  // Карточка WB для артикула (учитывая бренд из ЧЗ) — имя и баркоды по размерам.
  function wbCard(article, brand) {
    const entries = Object.entries(labelArticles || {}).filter(([, v]) => v.code === article || canonArticle(v.code) === article);
    if (!entries.length) return null;
    const b = String(brand || '').toLowerCase();
    const hit = entries.find(([, v]) => b && String(v.brand || '').toLowerCase() === b) || entries[0];
    return { key: hit[0], ...hit[1] };
  }
  // Баркод WB → артикул и размер (для файлов вида «баркод;код маркировки»).
  const barcodeMap = useMemo(() => {
    const m = {};
    Object.values(labelArticles || {}).forEach(v => (v.sizes || []).forEach(z => {
      if (!z.barcode) return;
      const o = { article: canonArticle(v.code), size: String(z.size), brand: v.brand || '', name: v.name || '' };
      const prev = m[z.barcode];
      if (prev && (prev.article !== o.article || prev.size !== o.size)) m[z.barcode] = { ...prev, ambiguous: true };
      else if (!prev) m[z.barcode] = o;
    }));
    return m;
  }, [labelArticles]);
  const barcodeFor = (card, size) => { const s = card && card.sizes.find(x => String(x.size) === String(size)); return s ? s.barcode : ''; };

  // ── Загрузка файла ──
  async function handleFile(e) {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    setBusy('Читаю файл…');
    try {
      const buf = await file.arrayBuffer();
      const { rows, errors } = parseKizFile(buf, { canonArticle, index, barcodeMap });
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
    const noBc = printSizes.filter(z => (Number(qtys[z]) || 0) > 0 && !barcodeFor(printCard, z));
    if (noBc.length && !window.confirm(`У размеров ${noBc.join(', ')} нет баркода WB в каталоге — этикетки напечатаются только с Честным Знаком, без штрихкода товара. Печатать?`)) return;
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
  // Образец: первая этикетка так, как она напечатается. Киз не списывается.
  async function showSample() {
    if (!printEntry) return;
    setBusy('Готовлю образец…');
    try {
      const store = await kvGet(keyArt(printArt));
      const has = z => store && store.sizes[z] && store.sizes[z].codes.length;
      const z = printSizes.find(x => (Number(qtys[x]) || 0) > 0 && has(x)) || printSizes.find(has);
      if (!z) { alert('Свободных кизов у артикула нет — образец показать не на чем.'); return; }
      setSample(await renderKizLabelPNG({ size: z, gtin: store.sizes[z].gtin, barcode: barcodeFor(printCard, z), code: store.sizes[z].codes[0],
        name: printCard ? printCard.name : '', article: printArt, brand: printEntry.brand || (printCard ? printCard.brand : '') }));
    } catch (err) { console.error(err); alert('Ошибка: ' + (err.message || err)); }
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
          <li><b>Или файл «баркод WB ; код маркировки»</b> (csv, без заголовка) — в первой колонке баркод товара из карточки WB,
            во второй полный код. Артикул и размер ВМС возьмёт сама по баркоду из каталога WB — перед загрузкой синхронизируй каталог в «Этикетках».</li>
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
                <button className="skl-btn skl-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setPrintArt(a); setQtys({}); setSample(''); }}><Printer size={12} /> Печать</button>{' '}
                <button className="skl-btn skl-btn-ghost" style={{ padding: '4px 8px', color: 'var(--negative)' }} title="Удалить все свободные кизы артикула" onClick={() => deleteArticle(a)}><Trash2 size={12} /></button>
              </td>
            </tr>; })}</tbody>
        </table>
      </React.Fragment>}
    </Section>

    <Section title="Печать этикеток с Честным Знаком" icon={<Printer size={18} />} open collapsible={false}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0, marginBottom: 12 }}>
        Одна этикетка 58×40 на пару: название, артикул, размер, бренд, штрихкод WB и DataMatrix Честного Знака с подписью кода (GTIN и серийный номер). Коды печатаются вектором под шаг термопринтера — печатай в масштабе 100% («Фактический размер»).
        Заполни количество по размерам вручную или по коробам (8 пар по сетке из «Этикеток»). Напечатанные кизы списываются с остатка.
      </p>
      <ArticleCombobox value={printArt} onChange={v => { setPrintArt(v); setQtys({}); setSample(''); }} options={arts}
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
          <button className="skl-btn skl-btn-ghost" disabled={!!busy} onClick={showSample}>Образец этикетки</button>
          {busyRow}
        </div>
        {sample && <div style={{ marginTop: 12 }}>
          <img src={sample} alt="Образец этикетки" style={{ width: 'min(464px, 100%)', display: 'block', background: '#fff', borderRadius: 6, border: '1px solid var(--line)' }} />
          <div style={{ ...soft, marginTop: 4 }}>Образец в масштабе 58×40 мм. Киз при показе образца не списывается.</div>
        </div>}
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
