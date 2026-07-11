import { DUCK_VB, DUCK_PATH } from './duck.js';
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

// ====================== ИКОНКИ (мини-набор в стиле lucide) ======================
function Icon({
  paths,
  size = 20,
  color = 'currentColor',
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style
  }, paths);
}
const Plus = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }))
}));
const Upload = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "17 8 12 3 7 8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "3",
    x2: "12",
    y2: "15"
  }))
}));
const ChevronDown = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  })
}));
const ChevronRight = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement("polyline", {
    points: "9 18 15 12 9 6"
  })
}));
const Download = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 10 12 15 17 10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "15",
    x2: "12",
    y2: "3"
  }))
}));
const Trash2 = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    y1: "11",
    x2: "10",
    y2: "17"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14",
    y1: "11",
    x2: "14",
    y2: "17"
  }))
}));
const Loader2 = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-6.219-8.56"
  })
}));
const RefreshCcw = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 2v6h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12A9 9 0 0 0 6 5.3L3 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 22v-6h-6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 0 0 15 6.7l3-2.7"
  }))
}));
const FileSpreadsheet = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "14 2 14 8 20 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 13h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 13h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 17h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 17h2"
  }))
}));
const Box = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m3.3 7 8.7 5 8.7-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 22V12"
  }))
}));
const AlertTriangle = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "9",
    x2: "12",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17"
  }))
}));
const Search = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  }))
}));
const Save = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "17 21 17 13 7 13 7 21"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 3 7 8 15 8"
  }))
}));
const FolderOpen = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement("path", {
    d: "m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"
  })
}));
const Calendar = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "2",
    x2: "16",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "2",
    x2: "8",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "10",
    x2: "21",
    y2: "10"
  }))
}));
const Camera = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "3"
  }))
}));
const Clock = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 6 12 12 16 14"
  }))
}));
const Sun = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
  }))
}));
const Moon = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement("path", {
    d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
  })
}));
const ClipboardList = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "2",
    width: "8",
    height: "4",
    rx: "1",
    ry: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "12",
    x2: "15",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "16",
    x2: "15",
    y2: "16"
  }))
}));
const Tag = p => /*#__PURE__*/React.createElement(Icon, _objectSpread(_objectSpread({}, p), {}, {
  paths: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12.59 2.59a2 2 0 0 0-2.83 0L2.59 9.76a2 2 0 0 0 0 2.83l8.82 8.82a2 2 0 0 0 2.83 0l7.17-7.17a2 2 0 0 0 0-2.83z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7.5",
    cy: "7.5",
    r: "1.5",
    fill: "currentColor",
    stroke: "none"
  }))
}));

// ====================== ОСНОВНОЙ КОМПОНЕНТ ======================

const KEY_INCOMES = 'sklad:incomes';
const KEY_SHIPMENTS = 'sklad:shipments';
const KEY_DEFECTS = 'sklad:defects';
const KEY_NAMES = 'sklad:names';
const KEY_PHOTO = 'sklad:photo';
const KEY_UNIDENTIFIED = 'sklad:unidentified';
const KEY_ACTIONS = 'sklad:actions';
const KEY_TZ_REQUESTS = 'sklad:tz_requests';
const KEY_TZ_WAREHOUSES = 'sklad:tz_warehouses';
const KEY_BARCODES = 'sklad:wb_barcodes';
const KEY_CATALOG = 'sklad:catalog';
const KEY_RECEIVING = 'sklad:receiving';
const RECEIVING_BUCKET = 'receiving';
const KEY_GRIDS = 'sklad:grids';
const ACTIONS_KEEP = 50;
const KEY_LAST_BACKUP = 'sklad:meta:lastBackup';
const BACKUP_PREFIX = 'sklad:backup:';
const BACKUP_KEEP = 14;
const NO_SIZE = '—';
const BOX_SIZE = 8;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
};
const FIELD_DEFS = {
  income: [{
    key: 'article',
    label: 'Артикул *',
    candidates: ['артикул', 'sku', 'код товара', 'артикул продавца']
  }, {
    key: 'size',
    label: 'Размер',
    candidates: ['размер', 'size']
  }, {
    key: 'qty',
    label: 'Количество *',
    candidates: ['кол-во', 'количество', 'колич', 'кол', 'qty', 'шт']
  }],
  shipment: [{
    key: 'article',
    label: 'Артикул *',
    candidates: ['артикул', 'sku', 'код товара', 'артикул продавца']
  }, {
    key: 'size',
    label: 'Размер',
    candidates: ['размер', 'size']
  }, {
    key: 'qty',
    label: 'Количество *',
    candidates: ['кол-во', 'количество', 'колич', 'кол', 'qty', 'шт']
  }, {
    key: 'date',
    label: 'Дата отгрузки',
    candidates: ['дата']
  }, {
    key: 'warehouse',
    label: 'Склад',
    candidates: ['склад']
  }]
};

// --- Парсер "Акт приёмки товара" Wildberries ---
function parseAkt(workbook, fileName) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ''
  });
  let headerIdx = -1;
  for (let i = 0; i < json.length; i++) {
    if (json[i].some(c => String(c).toLowerCase().includes('шк короба'))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) return null;
  const headers = json[headerIdx].map(c => String(c).toLowerCase());
  const artIdx = headers.findIndex(h => h.includes('артикул продавца'));
  const sizeIdx = headers.findIndex(h => h.includes('сорт'));
  const boxIdx = headers.findIndex(h => h.includes('шк короба'));
  const qtyIdx = headers.findIndex(h => h.includes('кол-во'));
  if (artIdx < 0 || sizeIdx < 0 || boxIdx < 0 || qtyIdx < 0) return null;
  let shipmentNumber = '';
  for (let i = 0; i < Math.min(json.length, 6) && !shipmentNumber; i++) {
    for (const cell of json[i]) {
      if (typeof cell === 'string') {
        const m = cell.match(/№\s*(\d+)/);
        if (m) {
          shipmentNumber = m[1];
          break;
        }
      }
    }
  }
  if (!shipmentNumber) {
    const m = fileName.match(/(\d{6,})/);
    if (m) shipmentNumber = m[1];
  }
  let date = todayISO();
  for (let i = 0; i < Math.min(json.length, 6); i++) {
    for (const cell of json[i]) {
      if (typeof cell === 'string') {
        const m = cell.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
        if (m) date = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      }
    }
  }
  const items = [];
  const names = {};
  const unidentifiedItems = [];
  let unidentified = 0;
  for (let i = headerIdx + 1; i < json.length; i++) {
    const r = json[i];
    if (typeof r[0] === 'string' && r[0].trim().toLowerCase().startsWith('итого')) continue;
    const artFull = r[artIdx];
    const qty = r[qtyIdx];
    const box = r[boxIdx];
    const hasArticle = typeof artFull === 'string' && artFull.trim() && !artFull.trim().toLowerCase().startsWith('неопознанн');
    if (typeof qty !== 'number' || qty <= 0) continue;
    if (hasArticle) {
      if (!box) continue;
      const parts = artFull.trim().split(/\s+/);
      const code = parts[0];
      const name = parts.slice(1).join(' ');
      if (name) names[code] = name;
      items.push({
        article: code,
        size: String(r[sizeIdx]).trim(),
        box: String(box).trim(),
        qty
      });
    } else {
      // Строка с количеством, но без артикула продавца — неопознанный товар (обезличка)
      unidentified += qty;
      if (box) unidentifiedItems.push({ box: String(box).trim(), qty });
    }
  }
  if (!items.length && !unidentified) return null;
  return {
    shipmentNumber,
    date,
    items,
    names,
    unidentified,
    unidentifiedItems,
    fileName
  };
}

// Брак = недостача пар по ВСЕЙ поставке: (кол-во коробов × 8) − (опознано + обезличка).
// 1 короб = 1 ШК короба = 8 пар. Обезличка (неопознанный товар) — это тоже реальные
// пары, поэтому засчитывается в наполнение короба и НЕ пересекается с браком.
// Пересорт (пары «переехали» между коробами/размерами) сам себя компенсирует в общем
// итоге. Оставшуюся недостачу распределяем на неполные короба (размер неизвестен).
function analyzeAkt(akt) {
  const items = akt.items || [];
  const uniItems = akt.unidentifiedItems || [];
  const boxes = {}; // box -> { article, ident, uni }
  items.forEach(it => {
    if (!boxes[it.box]) boxes[it.box] = { article: it.article, ident: 0, uni: 0 };
    if (!boxes[it.box].article) boxes[it.box].article = it.article;
    boxes[it.box].ident += it.qty;
  });
  uniItems.forEach(u => {
    if (!u.box) return;
    if (!boxes[u.box]) boxes[u.box] = { article: null, ident: 0, uni: 0 };
    boxes[u.box].uni += u.qty;
  });
  const boxIds = Object.keys(boxes);
  const totalIdent = items.reduce((s, it) => s + it.qty, 0);
  const totalUni = uniItems.reduce((s, u) => s + u.qty, 0);
  // Сводим каждый артикул к целым коробам: должно быть отгружено (коробов артикула × 8).
  // Недобор одного артикула гасится перебором другого (пересорт), обезличка засчитана в
  // наполнение. Остаток недобора по всей поставке = брак; коррекции пересорта пишем как
  // служебные (не-)отгрузки, чтобы не оставалось «+1»/«−1» на остатках.
  const perArt = {}; // article -> { boxes, ident, uni }
  Object.values(boxes).forEach(b => {
    if (!b.article) return;
    if (!perArt[b.article]) perArt[b.article] = { boxes: 0, ident: 0, uni: 0 };
    perArt[b.article].boxes += 1;
    perArt[b.article].ident += b.ident;
    perArt[b.article].uni += b.uni;
  });
  let netShort = Math.max(0, boxIds.length * BOX_SIZE - totalIdent - totalUni);
  const gaps = Object.entries(perArt).map(([article, v]) => ({ article, gap: v.boxes * BOX_SIZE - v.ident - v.uni }));
  const defectMap = {}; // article -> qty (брак)
  const rebalanceMap = {}; // article -> qty пересорт-коррекции (может быть < 0)
  gaps.filter(g => g.gap > 0).sort((a, b) => (b.gap - a.gap) || a.article.localeCompare(b.article)).forEach(g => {
    const brak = Math.min(g.gap, netShort);
    netShort -= brak;
    if (brak > 0) defectMap[g.article] = (defectMap[g.article] || 0) + brak;
    const pseudo = g.gap - brak; // недобор сверх брака — закрываем пересорт-отгрузкой
    if (pseudo > 0) rebalanceMap[g.article] = (rebalanceMap[g.article] || 0) + pseudo;
  });
  gaps.filter(g => g.gap < 0).forEach(g => { rebalanceMap[g.article] = (rebalanceMap[g.article] || 0) + g.gap; });
  const totalsMap = {};
  items.forEach(it => {
    const key = `${it.article}|||${it.size}`;
    totalsMap[key] = (totalsMap[key] || 0) + it.qty;
  });
  const splitKey = k => {
    const [article, size] = k.split('|||');
    return {
      article,
      size
    };
  };
  // Обезличка = отгружено. Пара лежала в коробе своего артикула, WB её не опознал,
  // но отгрузил → это отгрузка того артикула (размер неизвестен). Привязываем к артикулу
  // короба; если короб без опознанного артикула — остаётся «неопознанной» отдельно.
  const uniShipMap = {};
  let uniNoArticle = 0;
  Object.values(boxes).forEach(b => {
    if (b.uni > 0) {
      if (b.article) uniShipMap[b.article] = (uniShipMap[b.article] || 0) + b.uni;
      else uniNoArticle += b.uni;
    }
  });
  return {
    totals: Object.entries(totalsMap).map(([k, qty]) => _objectSpread(_objectSpread({}, splitKey(k)), {}, {
      qty
    })),
    defects: Object.entries(defectMap).map(([article, qty]) => ({
      article,
      size: NO_SIZE,
      qty
    })),
    unidentifiedShipments: Object.entries(uniShipMap).map(([article, qty]) => ({ article, qty })),
    unidentifiedNoArticle: uniNoArticle,
    rebalanceShipments: Object.entries(rebalanceMap).filter(([, q]) => q !== 0).map(([article, qty]) => ({ article, qty })),
    boxCount: boxIds.length
  };
}
function LabelPrintView({
  items
}) {
  useEffect(() => {
    items.forEach((item, i) => {
      const el = document.getElementById(`barcode-${i}`);
      if (el && window.JsBarcode) {
        try {
          const format = /^\d{12,13}$/.test(item.barcode) ? 'EAN13' : 'CODE128';
          window.JsBarcode(el, item.barcode, {
            format,
            displayValue: true,
            fontSize: 12,
            height: 40,
            margin: 0
          });
        } catch (e) {
          console.error('barcode render failed', e);
        }
      }
    });
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, [items]);
  return /*#__PURE__*/React.createElement("div", {
    className: "skl-label-sheet"
  }, items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    className: "skl-label",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl-article"
  }, item.article, " ", item.size !== NO_SIZE ? `· ${item.size}` : ''), item.name && /*#__PURE__*/React.createElement("div", {
    className: "lbl-meta"
  }, item.name), /*#__PURE__*/React.createElement("svg", {
    id: `barcode-${i}`
  }))));
}
function ArticleCombobox({
  value,
  onChange,
  options,
  names,
  placeholder
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(a => a.toLowerCase().includes(q) || (names[a] || '').toLowerCase().includes(q));
  }, [options, query, names]);
  if (!options.length) {
    return /*#__PURE__*/React.createElement("input", {
      className: "skl-input",
      placeholder: placeholder || 'Сначала загрузи приход',
      disabled: true
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "skl-input",
    style: {
      textAlign: 'left',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      gap: 6
    },
    onClick: () => {
      setOpen(o => !o);
      setQuery('');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, value || '—', names[value] ? ` — ${names[value]}` : ''), /*#__PURE__*/React.createElement(ChevronDown, {
    size: 14,
    style: {
      flexShrink: 0,
      color: 'var(--ink-soft)'
    }
  })), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      zIndex: 30,
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 4,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 6,
      boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    className: "skl-input",
    style: {
      border: 'none',
      borderBottom: '1px solid var(--line)',
      borderRadius: 0
    },
    placeholder: "Поиск артикула…",
    value: query,
    onChange: e => setQuery(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 220,
      overflowY: 'auto'
    }
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      fontSize: 13,
      color: 'var(--ink-soft)'
    }
  }, "Не найдено") : filtered.map(a => /*#__PURE__*/React.createElement("div", {
    key: a,
    className: "skl-row",
    style: {
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: 13
    },
    onClick: () => {
      onChange(a);
      setOpen(false);
      setQuery('');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: a === value ? 700 : 400
    }
  }, a), names[a] && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-soft)'
    }
  }, " — ", names[a]))))));
}
function Section({
  title,
  icon,
  open,
  onToggle,
  children,
  contentStyle,
  collapsible = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "skl-card",
    style: {
      marginBottom: 24,
      padding: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: collapsible ? onToggle : undefined,
    style: {
      padding: '14px 18px',
      cursor: collapsible ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: open ? '1px solid var(--line)' : 'none',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "skl-display",
    style: {
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, icon, title), collapsible && (open ? /*#__PURE__*/React.createElement(ChevronDown, {
    size: 18
  }) : /*#__PURE__*/React.createElement(ChevronRight, {
    size: 18
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: contentStyle || {
      padding: 18
    }
  }, children));
}
function SkladLedger() {
  const [incomes, setIncomes] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [defects, setDefects] = useState([]);
  const [photo, setPhoto] = useState([]);
  const [unidentified, setUnidentified] = useState([]);
  const [names, setNames] = useState({});
  const [actions, setActions] = useState([]);
  const [tzRequests, setTzRequests] = useState([]);
  const [expandedTz, setExpandedTz] = useState(null);
  const [mainSearch, setMainSearch] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoItems, setPhotoItems] = useState([{
    id: uid(),
    article: '',
    size: '',
    qty: '1'
  }]);
  const [photoDate, setPhotoDate] = useState(todayISO());
  const [photoNote, setPhotoNote] = useState('');
  const [tzItems, setTzItems] = useState([{
    id: uid(),
    article: '',
    mode: 'boxes',
    boxes: '1'
  }]);
  const [tzDate, setTzDate] = useState(todayISO());
  const [tzNote, setTzNote] = useState('');
  const [tzWarehouse, setTzWarehouse] = useState('');
  const [tzWarehouses, setTzWarehouses] = useState([]);
  const [barcodes, setBarcodes] = useState({});
  const [barcodesSyncedAt, setBarcodesSyncedAt] = useState(null);
  const [syncingBarcodes, setSyncingBarcodes] = useState(false);

  // Новая логика этикеток — загрузка Excel и генерация PDF
  const [labelFile, setLabelFile] = useState(null);
  const [labelArticles, setLabelArticles] = useState({});
  const [catalog, setCatalog] = useState({});
  const [grids, setGrids] = useState({}); // code -> массив задвоенных размеров
  const [receiving, setReceiving] = useState([]);
  const [recvDate, setRecvDate] = useState(() => todayISO());
  const [recvTruck, setRecvTruck] = useState('');
  const [recvCarrier, setRecvCarrier] = useState('');
  const [recvBoxes, setRecvBoxes] = useState('');
  const [recvNote, setRecvNote] = useState('');
  const [recvTruckPhotos, setRecvTruckPhotos] = useState([]);
  const [recvCargoPhotos, setRecvCargoPhotos] = useState([]);
  const [recvSaving, setRecvSaving] = useState(false);
  const [recvProgress, setRecvProgress] = useState('');
  const [recvItems, setRecvItems] = useState([]); // [{ id, article, boxes }]
  function addRecvItem() { setRecvItems(prev => [...prev, { id: uid(), article: '', boxes: '' }]); }
  function updateRecvItem(id, field, value) { setRecvItems(prev => prev.map(it => it.id === id ? _objectSpread(_objectSpread({}, it), {}, { [field]: value }) : it)); }
  function removeRecvItem(id) { setRecvItems(prev => prev.filter(it => it.id !== id)); }
  const [labelBoxes, setLabelBoxes] = useState({});
  const [labelError, setLabelError] = useState('');
  const [generatingLabels, setGeneratingLabels] = useState(false);
  const [bundlingTz, setBundlingTz] = useState(null);
  const [wbBusy, setWbBusy] = useState(null);
  const [wbPromptFor, setWbPromptFor] = useState(null);
  const [wbNumber, setWbNumber] = useState('WB_');
  const [labelProgress, setLabelProgress] = useState('');
  const [labelSelected, setLabelSelected] = useState([]);
  const [labelSearch, setLabelSearch] = useState('');
  const [syncError, setSyncError] = useState('');
  const [labelSelections, setLabelSelections] = useState({});
  const [printMode, setPrintMode] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [aktPreview, setAktPreview] = useState(null);
  const [aktTzId, setAktTzId] = useState(null); // ТЗ, из которого загружают акт (стадия «отгружено»)
  const [expanded, setExpanded] = useState(null);
  const [searchShipment, setSearchShipment] = useState('');
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('sklad_role') || null;
    } catch (_unused) {
      return null;
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try {
      // «Полночь» — тёмная тема по умолчанию (светлая только если выбрана явно).
      return localStorage.getItem('sklad_theme') !== 'light';
    } catch (_unused2) {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('sklad_theme', darkMode ? 'dark' : 'light');
      document.body.style.background = darkMode ? '#181510' : '#F5EFE1';
    } catch (_unused3) {}
  }, [darkMode]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  function chooseRole(r) {
    try {
      localStorage.setItem('sklad_role', r);
    } catch (_unused4) {}
    setRole(r);
    setActiveTab(r === 'client' ? 'tz' : 'main');
  }
  function switchRole() {
    try {
      localStorage.removeItem('sklad_role');
    } catch (_unused5) {}
    setRole(null);
  }
  const [openSections, setOpenSections] = useState({
    stats: false,
    upload: true,
    photo: false,
    period: false,
    shipments: false,
    unidentified: false,
    backups: false,
    actions: false,
    defectStats: false,
    main: true
  });
  const toggleSection = key => setOpenSections(prev => _objectSpread(_objectSpread({}, prev), {}, {
    [key]: !prev[key]
  }));
  const [expandedShipment, setExpandedShipment] = useState(null);
  const [statsFrom, setStatsFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [statsTo, setStatsTo] = useState(todayISO());
  const [backupList, setBackupList] = useState([]);
  const [restoring, setRestoring] = useState(false);
  useEffect(() => {
    loadAll();
  }, []);
  useEffect(() => {
    if (!printMode) return;
    function handleAfterPrint() {
      setPrintMode(false);
    }
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [printMode]);
  useEffect(() => {
    if (!loading) {
      runAutoBackup();
      refreshBackupList();
    }
  }, [loading]);
  async function refreshBackupList() {
    try {
      const list = await window.storage.listByPrefix(BACKUP_PREFIX);
      setBackupList(list);
    } catch (e) {
      console.error('backup list failed', e);
    }
  }
  async function runAutoBackup() {
    const today = todayISO();
    try {
      const meta = await window.storage.get(KEY_LAST_BACKUP);
      const last = meta ? JSON.parse(meta.value) : null;
      if (last === today) return;
      const payload = {
        incomes,
        shipments,
        defects,
        photo,
        unidentified,
        names,
        tzRequests,
        tzWarehouses,
        savedAt: new Date().toISOString()
      };
      await window.storage.set(BACKUP_PREFIX + today, JSON.stringify(payload));
      await window.storage.set(KEY_LAST_BACKUP, JSON.stringify(today));
      const list = await window.storage.listByPrefix(BACKUP_PREFIX);
      if (list.length > BACKUP_KEEP) {
        const toDelete = list.slice(BACKUP_KEEP); // list is ordered desc by key, oldest at the end
        for (const item of toDelete) {
          await window.storage.delete(item.key);
        }
      }
      refreshBackupList();
    } catch (e) {
      console.error('auto backup failed', e);
    }
  }
  async function restoreBackup(key) {
    const dateLabel = key.replace(BACKUP_PREFIX, '');
    if (!window.confirm(`Восстановить данные на момент ${fmtDate(dateLabel)}? Текущие данные будут заменены этой копией.`)) return;
    setRestoring(true);
    try {
      const r = await window.storage.get(key);
      if (!r) {
        alert('Копия не найдена.');
        return;
      }
      const data = JSON.parse(r.value);
      if (data.incomes) await persist(KEY_INCOMES, data.incomes, setIncomes);
      if (data.shipments) await persist(KEY_SHIPMENTS, data.shipments, setShipments);
      if (data.defects) await persist(KEY_DEFECTS, data.defects, setDefects);
      if (data.photo) await persist(KEY_PHOTO, data.photo, setPhoto);
      if (data.unidentified) await persist(KEY_UNIDENTIFIED, data.unidentified, setUnidentified);
      if (data.names) await persist(KEY_NAMES, data.names, setNames);
      if (data.tzRequests) await persist(KEY_TZ_REQUESTS, data.tzRequests, setTzRequests);
      if (data.tzWarehouses) await persist(KEY_TZ_WAREHOUSES, data.tzWarehouses, setTzWarehouses);
      alert('Готово, данные восстановлены.');
    } catch (e) {
      console.error(e);
      alert('Не получилось восстановить копию.');
    } finally {
      setRestoring(false);
    }
  }
  async function loadAll() {
    setLoading(true);
    try {
      const r = await window.storage.get(KEY_INCOMES, true);
      const val = r ? JSON.parse(r.value) : [];
      setIncomes(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused6) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_SHIPMENTS, true);
      const val = r ? JSON.parse(r.value) : [];
      setShipments(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused7) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_DEFECTS, true);
      const val = r ? JSON.parse(r.value) : [];
      setDefects(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused8) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_PHOTO, true);
      const val = r ? JSON.parse(r.value) : [];
      setPhoto(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused9) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_UNIDENTIFIED, true);
      const val = r ? JSON.parse(r.value) : [];
      setUnidentified(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused0) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_ACTIONS, true);
      const val = r ? JSON.parse(r.value) : [];
      setActions(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused1) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_TZ_REQUESTS, true);
      const val = r ? JSON.parse(r.value) : [];
      setTzRequests(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused10) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_TZ_WAREHOUSES, true);
      const val = r ? JSON.parse(r.value) : [];
      setTzWarehouses(prev => val.length === 0 && prev.length > 0 ? prev : val);
    } catch (_unused11) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_BARCODES, true);
      if (r) {
        const val = JSON.parse(r.value);
        setBarcodes(val.articles || {});
        setBarcodesSyncedAt(val.syncedAt || null);
      }
    } catch (_unused12) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_NAMES, true);
      const val = r ? JSON.parse(r.value) : {};
      setNames(prev => Object.keys(val).length === 0 && Object.keys(prev).length > 0 ? prev : val);
    } catch (_unused13) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_CATALOG, true);
      const val = r ? JSON.parse(r.value) : {};
      setCatalog(prev => Object.keys(val).length === 0 && Object.keys(prev).length > 0 ? prev : val);
    } catch (_unusedCat) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_RECEIVING, true);
      if (r) setReceiving(JSON.parse(r.value));
    } catch (_unusedRecv) {/* keep current data on error */}
    try {
      const r = await window.storage.get(KEY_GRIDS, true);
      const val = r ? JSON.parse(r.value) : {};
      setGrids(prev => Object.keys(val).length === 0 && Object.keys(prev).length > 0 ? prev : val);
    } catch (_unusedGrids) {/* keep current data on error */}
    setLoading(false);
  }
  async function persist(key, value, setter) {
    setter(value);
    setSaving(true);
    try {
      await window.storage.set(key, JSON.stringify(value), true);
    } catch (e) {
      console.error('storage error', e);
    }
    setSaving(false);
  }
  function sizesForArticle(article) {
    const found = summary.find(s => s.article === article);
    return found ? found.sizes.map(sz => sz.size) : [];
  }
  function addPhotoRow() {
    const article = photoArticleOptions[0] || '';
    const size = sizesForArticle(article)[0] || '';
    setPhotoItems(prev => [...prev, {
      id: uid(),
      article,
      size,
      qty: '1'
    }]);
  }
  function removePhotoRow(id) {
    setPhotoItems(prev => prev.length > 1 ? prev.filter(it => it.id !== id) : prev);
  }
  function updatePhotoRow(id, field, value) {
    setPhotoItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const updated = _objectSpread(_objectSpread({}, it), {}, {
        [field]: value
      });
      if (field === 'article') updated.size = sizesForArticle(value)[0] || '';
      return updated;
    }));
  }
  function confirmPhotoBatch() {
    const entries = photoItems.filter(it => it.article && Number(it.qty) > 0).map(it => ({
      id: uid(),
      article: it.article,
      size: it.size || NO_SIZE,
      qty: Number(it.qty),
      date: photoDate,
      note: photoNote.trim(),
      consumedQty: 0,
      addedAt: new Date().toISOString()
    }));
    if (!entries.length) return;

    // Если по этому артикулу/размеру уже есть записанный брак — переквалифицируем его часть в фотостудию
    let updatedDefects = defects.map(d => _objectSpread({}, d));
    let reclassifiedTotal = 0;
    entries.forEach(entry => {
      let need = entry.qty;
      for (const d of updatedDefects) {
        if (need <= 0) break;
        if (d.article === entry.article && d.size === entry.size && d.qty > 0) {
          const take = Math.min(need, d.qty);
          d.qty -= take;
          entry.consumedQty += take;
          reclassifiedTotal += take;
          need -= take;
        }
      }
    });
    updatedDefects = updatedDefects.filter(d => d.qty > 0);
    persist(KEY_PHOTO, [...photo, ...entries], setPhoto);
    if (reclassifiedTotal > 0) {
      persist(KEY_DEFECTS, updatedDefects, setDefects);
    }
    let label = `Фотостудия (${fmtDate(photoDate)}): ` + entries.map(e => `${e.article} ${e.size}×${e.qty}`).join(', ');
    if (reclassifiedTotal > 0) label += ` · переквалифицировано из брака: ${reclassifiedTotal} шт.`;
    logAction(label, {
      photo: entries.map(e => e.id)
    });
    const firstArticle = photoArticleOptions[0] || '';
    setPhotoItems([{
      id: uid(),
      article: firstArticle,
      size: sizesForArticle(firstArticle)[0] || '',
      qty: '1'
    }]);
    setPhotoNote('');
    if (reclassifiedTotal > 0) {
      alert(`Готово. ${reclassifiedTotal} шт. из ранее записанного брака переквалифицировано в фотостудию (совпали артикул и размер).`);
    }
  }
  function addTzRow() {
    const article = photoArticleOptions[0] || '';
    setTzItems(prev => [...prev, {
      id: uid(),
      article,
      mode: 'boxes',
      boxes: '1'
    }]);
  }
  function removeTzRow(id) {
    setTzItems(prev => prev.length > 1 ? prev.filter(it => it.id !== id) : prev);
  }
  function updateTzRow(id, field, value) {
    setTzItems(prev => prev.map(it => it.id === id ? _objectSpread(_objectSpread({}, it), {}, {
      [field]: value
    }) : it));
  }
  function formatBoxes(num) {
    return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
  function tzQty(it) {
    const balance = balanceForArticle(it.article);
    return it.mode === 'all' ? balance : Number(it.boxes || 0) * BOX_SIZE;
  }
  function tzRows() {
    return tzItems.filter(it => it.article).map(it => {
      const balance = balanceForArticle(it.article);
      const boxesNumeric = it.mode === 'all' ? balance / BOX_SIZE : Number(it.boxes || 0);
      return {
        article: it.article,
        name: names[it.article] || '',
        balance,
        boxesLabel: formatBoxes(boxesNumeric),
        boxesNumeric,
        qty: tzQty(it)
      };
    });
  }
  function totalBoxesLabel(rowsData) {
    const total = rowsData.reduce((s, r) => s + r.boxesNumeric, 0);
    return formatBoxes(total);
  }
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  function buildTzExcelBlob(rowsData) {
    const data = rowsData.map(r => ({
      'Артикул': r.article,
      'Название': r.name,
      'Короба': r.boxesLabel,
      'Кол-во, шт.': r.qty,
      'Остаток на момент составления, шт.': r.balance
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ТЗ отгрузка');
    const arr = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function downloadTzExcel(rowsData, date) {
    triggerDownload(buildTzExcelBlob(rowsData), `tz_otgruzka_${date}.xlsx`);
  }
  function aoaXlsxBlob(rows) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
    const arr = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  // Генерация файлов поставки WB (Boxes + Summary) из заявки ТЗ.
  // Размерный ряд (8 пар в коробе) — из остатка склада. Первый ШК короба вводится вручную.
  async function downloadWbSupply(r, input) {
    const m = String(input || '').match(/(\d{3,})/);
    if (!m) { alert('Введите номер короба в формате WB_1611640048'); return; }
    setWbPromptFor(null);
    setWbBusy(r.id);
    try {
      let boxNum = parseInt(m[1], 10);
      // Этикетки на короба: PDF, по одной этикетке на короб (артикул + ШК короба + номер).
      const { jsPDF } = window.jspdf;
      const LWmm = 58, LHmm = 40, MM = 300 / 25.4, PT = 300 / 72;
      const labelDoc = new jsPDF({ unit: 'mm', format: [LWmm, LHmm], orientation: 'landscape' });
      let firstLabel = true;
      const renderBoxLabel = async (article, wbCode) => {
        const W = Math.round(LWmm * MM), H = Math.round(LHmm * MM);
        const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H;
        const ctx = cvs.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#000'; ctx.textAlign = 'center';
        const maxW = W - Math.round(6 * MM);
        let artPt = 22; ctx.font = `bold ${Math.round(artPt * PT)}px Arial`;
        while (ctx.measureText(article).width > maxW && artPt > 8) { artPt -= 0.5; ctx.font = `bold ${Math.round(artPt * PT)}px Arial`; }
        ctx.fillText(article, W / 2, Math.round(12 * MM));
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        document.body.appendChild(svg);
        window.JsBarcode(svg, wbCode, { format: 'CODE128', displayValue: false, width: 2, height: 80, margin: 0, background: '#ffffff', lineColor: '#000000' });
        const svgStr = new XMLSerializer().serializeToString(svg);
        document.body.removeChild(svg);
        const img = new Image();
        const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml' }));
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        URL.revokeObjectURL(url);
        const bcW = W - Math.round(10 * MM), bcH = Math.round(13 * MM);
        ctx.drawImage(img, (W - bcW) / 2, Math.round(16 * MM), bcW, bcH);
        ctx.font = `${Math.round(6 * PT)}px Arial`;
        ctx.fillText(wbCode, W / 2, Math.round(35 * MM));
        return cvs.toDataURL('image/png');
      };
      // Разложить 8 пар по размерам пропорционально остатку (целые, сумма ровно 8).
      const distribute8 = weights => {
        const total = weights.reduce((a, b) => a + b, 0);
        if (total <= 0) return null;
        const raw = weights.map(w => w / total * 8);
        const res = raw.map(x => Math.floor(x));
        const order = raw.map((x, i) => ({ i, f: x - Math.floor(x) })).sort((a, b) => b.f - a.f);
        let guard = 0;
        while (res.reduce((a, b) => a + b, 0) < 8 && guard < 100) {
          res[order[guard % order.length].i]++;
          guard++;
        }
        return res;
      };
      const boxesRows = [['Баркод товара', 'Кол-во товаров', 'ШК короба', 'Срок годности']];
      const summaryMap = new Map();
      const missing = [];
      for (const row of r.rows) {
        const code = row.article;
        const boxes = Math.round(row.boxesNumeric || 0);
        if (boxes <= 0) continue;
        const data = labelArticles[code];
        if (!data || !data.sizes.length) { missing.push(code); continue; }
        const sizes = [...data.sizes].sort((a, b) => (Number(a.size) || 0) - (Number(b.size) || 0));
        // Если задана размерная сетка артикула — берём её; иначе распределяем по остатку.
        const gv = gridVector(code);
        const vec = gv ? sizes.map(s => gv[String(s.size)] || 0) : distribute8(sizes.map(s => s.qty));
        if (!vec || vec.reduce((a, b) => a + b, 0) === 0) { missing.push(code); continue; }
        for (let b = 0; b < boxes; b++) {
          const wb = 'WB_' + boxNum++;
          if (!firstLabel) labelDoc.addPage([LWmm, LHmm], 'landscape');
          firstLabel = false;
          labelDoc.addImage(await renderBoxLabel(code, wb), 'PNG', 0, 0, LWmm, LHmm);
          sizes.forEach((s, i) => {
            if (vec[i] > 0) {
              const bc = Number(s.barcode) || s.barcode;
              boxesRows.push([bc, vec[i], wb, null]);
              summaryMap.set(bc, (summaryMap.get(bc) || 0) + vec[i]);
            }
          });
        }
      }
      if (boxesRows.length === 1) {
        alert('Нет данных для генерации: у артикулов заявки нет остатка (размерный ряд берётся из остатка склада).');
        return;
      }
      const summaryRows = [['Баркод', 'Количество'], ...[...summaryMap.entries()].map(([bc, q]) => [bc, q])];
      const zip = new window.JSZip();
      zip.file(`boxes_${r.date}.xlsx`, aoaXlsxBlob(boxesRows));
      zip.file(`summary_${r.date}.xlsx`, aoaXlsxBlob(summaryRows));
      if (!firstLabel) zip.file(`labels_${r.date}.pdf`, labelDoc.output('blob'));
      const blob = await zip.generateAsync({ type: 'blob' });
      const lastBox = boxNum - 1;
      triggerDownload(blob, `Поставка_WB_${fmtDate(r.date)}.zip`);
      const totalBoxes = boxesRows.slice(1).map(x => x[2]).filter((v, i, a) => a.indexOf(v) === i).length;
      let msg = `Готово! ${totalBoxes} коробов (до WB_${lastBox}).`;
      if (missing.length) msg += `\nПропущены (нет остатка/каталога): ${missing.join(', ')}`;
      alert(msg);
    } catch (e) {
      console.error(e);
      alert('Ошибка генерации: ' + (e.message || e));
    } finally {
      setWbBusy(null);
    }
  }
  // Сжимаем фото перед загрузкой (телефонные фото по 3-5 МБ -> ~200-400 КБ).
  function compressImage(file) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(img.src);
        c.toBlob(b => resolve(b || file), 'image/jpeg', 0.8);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }
  async function submitReceiving() {
    if (!recvTruck.trim()) { alert('Укажите номер машины.'); return; }
    const validItems = recvItems.filter(it => it.article && Number(it.boxes) > 0);
    for (const it of validItems) {
      if (!gridVector(it.article)) {
        alert(`Задай размерную сетку (сумма 8) для артикула «${it.article}» — он приходит впервые.`);
        return;
      }
    }
    setRecvSaving(true);
    setRecvProgress('');
    try {
      const id = uid();
      const all = [
        ...recvTruckPhotos.map(f => ({ f, kind: 'truck' })),
        ...recvCargoPhotos.map(f => ({ f, kind: 'cargo' }))
      ];
      const photos = [];
      for (let i = 0; i < all.length; i++) {
        setRecvProgress(`Загружаю фото ${i + 1} из ${all.length}…`);
        const blob = await compressImage(all[i].f);
        const path = `${id}/${all[i].kind}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
        const { error } = await window.supabase.storage.from(RECEIVING_BUCKET).upload(path, blob, {
          contentType: 'image/jpeg', upsert: false
        });
        if (error) throw error;
        const { data } = window.supabase.storage.from(RECEIVING_BUCKET).getPublicUrl(path);
        photos.push({ url: data.publicUrl, path, kind: all[i].kind });
      }
      // Приход = короба × размерная сетка (по каждому размеру). Создаёт остаток.
      let incomeIds = [], incomeQty = 0, items = [];
      if (validItems.length) {
        const newIncomes = [];
        for (const it of validItems) {
          const gv = gridVector(it.article);
          const boxes = Number(it.boxes) || 0;
          for (const [size, count] of Object.entries(gv)) {
            newIncomes.push({
              id: uid(), article: it.article, size: String(size), qty: count * boxes,
              date: recvDate, addedAt: new Date().toISOString(),
              note: `Приёмка машины ${recvTruck.trim()}`, recvId: id
            });
          }
        }
        incomeIds = newIncomes.map(x => x.id);
        incomeQty = newIncomes.reduce((s, x) => s + x.qty, 0);
        items = validItems.map(it => ({ article: it.article, boxes: Number(it.boxes) || 0, qty: (Number(it.boxes) || 0) * BOX_SIZE })).sort((a, b) => b.qty - a.qty);
        await persist(KEY_INCOMES, [...incomes, ...newIncomes], setIncomes);
      }
      const record = {
        id, date: recvDate, truck: recvTruck.trim(), carrier: recvCarrier.trim(),
        boxes: recvBoxes, note: recvNote.trim(), photos,
        incomeIds, incomeCount: incomeIds.length, incomeQty, items,
        addedAt: new Date().toISOString(), createdBy: role
      };
      await persist(KEY_RECEIVING, [record, ...receiving], setReceiving);
      logAction(`Приёмка машины ${record.truck}${record.boxes ? ` · ${record.boxes}` : ''}${incomeQty ? ` · приход ${incomeQty} шт.` : ''}${photos.length ? ` · фото ${photos.length}` : ''}`, incomeIds.length ? { incomes: incomeIds } : {});
      setRecvTruck(''); setRecvCarrier(''); setRecvBoxes(''); setRecvNote('');
      setRecvTruckPhotos([]); setRecvCargoPhotos([]); setRecvProgress('');
      setRecvItems([]);
      alert('Приёмка сохранена.' + (incomeQty ? ` Приход: ${incomeQty} шт.` : ''));
    } catch (e) {
      console.error(e);
      const msg = (e && e.message) || String(e);
      if (/bucket|not found|does not exist/i.test(msg)) {
        alert('Хранилище фото не настроено (бакет «receiving»). Создайте его в Supabase по инструкции и повторите.');
      } else {
        alert('Ошибка сохранения: ' + msg);
      }
    } finally {
      setRecvSaving(false);
      setRecvProgress('');
    }
  }
  async function deleteReceiving(rec) {
    const hasIncome = rec.incomeIds && rec.incomeIds.length;
    const warn = `Удалить запись приёмки машины ${rec.truck} от ${fmtDate(rec.date)}?\nФото удалятся.` +
      (hasIncome ? `\nСвязанный приход (${rec.incomeQty || 0} шт.) тоже удалится — остаток уменьшится.` : '');
    if (!window.confirm(warn)) return;
    try {
      if (rec.photos && rec.photos.length) {
        await window.supabase.storage.from(RECEIVING_BUCKET).remove(rec.photos.map(p => p.path));
      }
    } catch (e) { console.error('remove photos failed', e); }
    if (hasIncome) {
      await persist(KEY_INCOMES, incomes.filter(i => !rec.incomeIds.includes(i.id)), setIncomes);
    }
    persist(KEY_RECEIVING, receiving.filter(x => x.id !== rec.id), setReceiving);
  }
  // Разбивка приёмки по артикулам: из сохранённого record.items, а если его нет
  // (старые записи) — считаем из связанного прихода.
  function receivingItems(rec) {
    if (rec.items && rec.items.length) return rec.items;
    if (rec.incomeIds && rec.incomeIds.length) {
      const byArticle = {};
      incomes.filter(i => rec.incomeIds.includes(i.id)).forEach(i => { byArticle[i.article] = (byArticle[i.article] || 0) + i.qty; });
      return Object.entries(byArticle).map(([article, qty]) => ({ article, qty, boxes: qty / BOX_SIZE })).sort((a, b) => b.qty - a.qty);
    }
    return [];
  }
  function buildTzWordBlob(rowsData, date, note, warehouse) {
    const rows = rowsData.map(r => `
      <tr>
        <td style="padding:8px;border:1px solid #999;">${r.article}${r.name ? ' — ' + r.name : ''}</td>
        <td style="padding:8px;border:1px solid #999;text-align:center;">${r.boxesLabel}</td>
      </tr>`).join('');
    const totalLabel = totalBoxesLabel(rowsData);
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>ТЗ на отгрузку</title></head>
      <body style="font-family: Arial, sans-serif; font-size: 14px;">
        <h2 style="margin-bottom:0;">Задание складу на отгрузку</h2>
        <p style="margin-top:4px;color:#555;">ИП Мукозобов Д.В.</p>
        <p>Дата: ${fmtDate(date)}</p>
        ${warehouse ? `<p>Склад WB: ${warehouse}</p>` : ''}
        ${note ? `<p>Комментарий: ${note}</p>` : ''}
        <table style="border-collapse:collapse;width:100%;margin-top:12px;">
          <tr style="background:#eee;">
            <th style="padding:8px;border:1px solid #999;text-align:left;">Артикул</th>
            <th style="padding:8px;border:1px solid #999;">Короба</th>
          </tr>
          ${rows}
          <tr>
            <td style="padding:8px;border:1px solid #999;font-weight:bold;">Итого, коробов</td>
            <td style="padding:8px;border:1px solid #999;text-align:center;font-weight:bold;">${totalLabel}</td>
          </tr>
        </table>
      </body></html>`;
    return new Blob(['\ufeff', html], { type: 'application/msword' });
  }
  function downloadTzWord(rowsData, date, note, warehouse) {
    triggerDownload(buildTzWordBlob(rowsData, date, note, warehouse), `tz_otgruzka_${date}.doc`);
  }
  async function downloadTzBundle(r) {
    if (bundlingTz) return;
    setBundlingTz(r.id);
    try {
      const zip = new window.JSZip();
      zip.file(`\u0422\u0417_${r.date}.doc`, buildTzWordBlob(r.rows, r.date, r.note, r.warehouse));
      zip.file(`\u0422\u0417_${r.date}.xlsx`, buildTzExcelBlob(r.rows));
      const labelInput = r.rows.filter(row => row.boxesNumeric > 0).map(row => ({ artStr: row.article, boxes: row.boxesNumeric }));
      let labelBlobs = [];
      try {
        labelBlobs = (await generateLabelPDFs(labelInput, { returnBlobs: true })) || [];
      } catch (e) {
        console.error('labels for bundle failed:', e);
      }
      labelBlobs.forEach(({ code, blob }) => zip.file(`\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438/${code}.pdf`, blob));
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, `\u041e\u0442\u0433\u0440\u0443\u0437\u043a\u0430_${fmtDate(r.date)}.zip`);
      if (!labelBlobs.length) {
        alert('\u0410\u0440\u0445\u0438\u0432 \u0441\u043a\u0430\u0447\u0430\u043d, \u043d\u043e \u0411\u0415\u0417 \u044d\u0442\u0438\u043a\u0435\u0442\u043e\u043a: \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b \u0448\u0442\u0440\u0438\u0445\u043a\u043e\u0434\u044b \u0434\u043b\u044f \u0430\u0440\u0442\u0438\u043a\u0443\u043b\u043e\u0432 \u0437\u0430\u044f\u0432\u043a\u0438.\n\n\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u0430\u0439\u043b \u0441 \u0431\u0430\u0440\u043a\u043e\u0434\u0430\u043c\u0438 \u0432 \u0440\u0430\u0437\u0434\u0435\u043b\u0435 \u00ab\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438\u00bb (\u0442\u043e\u0442 \u0436\u0435, \u0447\u0442\u043e \u0434\u043b\u044f \u043f\u0435\u0447\u0430\u0442\u0438), \u0437\u0430\u0442\u0435\u043c \u0441\u043a\u0430\u0447\u0430\u0439\u0442\u0435 \u043f\u0430\u043a\u0435\u0442 \u0441\u043d\u043e\u0432\u0430.');
      }
    } catch (e) {
      console.error(e);
      alert('\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0430\u0440\u0445\u0438\u0432: ' + (e.message || e));
    } finally {
      setBundlingTz(null);
    }
  }
  function submitTzRequest() {
    const rowsData = tzRows();
    if (!rowsData.length) {
      alert('Добавь хотя бы один артикул.');
      return;
    }
    const totalLabel = totalBoxesLabel(rowsData);
    const roleLabel = role === 'client' ? 'Клиент' : 'Фулфилмент';
    const warehouse = tzWarehouse.trim();
    const requestId = uid();
    const request = {
      id: requestId,
      date: tzDate,
      note: tzNote,
      warehouse,
      rows: rowsData,
      totalBoxes: totalLabel,
      status: 'new',
      createdBy: role,
      addedAt: new Date().toISOString()
    };
    persist(KEY_TZ_REQUESTS, [request, ...tzRequests], setTzRequests);
    logAction(`ТЗ на отгрузку от ${fmtDate(tzDate)}: ${rowsData.length} артикулов, ${totalLabel} коробов${warehouse ? ` · склад: ${warehouse}` : ''}`, {
      tzRequests: [requestId]
    });
    if (warehouse) {
      const deduped = [warehouse, ...tzWarehouses.filter(w => w.toLowerCase() !== warehouse.toLowerCase())].slice(0, 20);
      persist(KEY_TZ_WAREHOUSES, deduped, setTzWarehouses);
    }
    alert(`Заявка отправлена складу (${roleLabel}).`);
  }
  function updateTzStatus(id, status) {
    persist(KEY_TZ_REQUESTS, tzRequests.map(r => r.id === id ? _objectSpread(_objectSpread({}, r), {}, {
      status
    }) : r), setTzRequests);
  }
  function deleteTzRequest(id) {
    if (!window.confirm('Удалить эту заявку из списка?')) return;
    persist(KEY_TZ_REQUESTS, tzRequests.filter(r => r.id !== id), setTzRequests);
  }
  function logAction(label, refs) {
    const roleLabel = role === 'client' ? 'Клиент' : 'Фулфилмент';
    const entry = {
      id: uid(),
      label: `[${roleLabel}] ${label}`,
      refs,
      date: todayISO(),
      addedAt: new Date().toISOString()
    };
    const updated = [entry, ...actions].slice(0, ACTIONS_KEEP);
    persist(KEY_ACTIONS, updated, setActions);
  }
  function undoAction(actionId) {
    var _r$incomes, _r$shipments, _r$defects, _r$photo, _r$unidentified, _r$tzRequests;
    const action = actions.find(a => a.id === actionId);
    if (!action) return;
    if (!window.confirm(`Отменить действие «${action.label}»?\nСвязанные записи будут удалены без возможности восстановления (кроме как из резервной копии).`)) return;
    const r = action.refs || {};
    if ((_r$incomes = r.incomes) !== null && _r$incomes !== void 0 && _r$incomes.length) persist(KEY_INCOMES, incomes.filter(i => !r.incomes.includes(i.id)), setIncomes);
    if ((_r$shipments = r.shipments) !== null && _r$shipments !== void 0 && _r$shipments.length) persist(KEY_SHIPMENTS, shipments.filter(s => !r.shipments.includes(s.id)), setShipments);
    if ((_r$defects = r.defects) !== null && _r$defects !== void 0 && _r$defects.length) persist(KEY_DEFECTS, defects.filter(d => !r.defects.includes(d.id)), setDefects);
    if ((_r$photo = r.photo) !== null && _r$photo !== void 0 && _r$photo.length) persist(KEY_PHOTO, photo.filter(p => !r.photo.includes(p.id)), setPhoto);
    if ((_r$unidentified = r.unidentified) !== null && _r$unidentified !== void 0 && _r$unidentified.length) persist(KEY_UNIDENTIFIED, unidentified.filter(u => !r.unidentified.includes(u.id)), setUnidentified);
    if ((_r$tzRequests = r.tzRequests) !== null && _r$tzRequests !== void 0 && _r$tzRequests.length) persist(KEY_TZ_REQUESTS, tzRequests.filter(t => !r.tzRequests.includes(t.id)), setTzRequests);
    persist(KEY_ACTIONS, actions.filter(a => a.id !== actionId), setActions);
  }
  // Загрузка каталога товаров (плоский файл: Название, Баркод, Артикул, Цвет, Размер, ...).
  // Сохраняем в Supabase (KEY_CATALOG) — загрузил один раз, работает везде и после перезагрузки.
  function handleLabelFile(file) {
    if (!file) return;
    setLabelFile(file);
    setLabelError('');
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
        // Ищем строку заголовка с колонками Название / Баркод / Артикул / Размер
        let hdr = -1, col = {};
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const r = (rows[i] || []).map(c => String(c == null ? '' : c).toLowerCase().trim());
          const find = sub => r.findIndex(c => c.includes(sub));
          const cName = find('назван'), cBar = find('баркод'), cArt = find('артикул'), cSize = find('размер');
          if (cName !== -1 && cBar !== -1 && cArt !== -1 && cSize !== -1) {
            hdr = i;
            col = { name: cName, bar: cBar, art: cArt, size: cSize, color: find('цвет'), brand: find('бренд') };
            break;
          }
        }
        if (hdr === -1) {
          setLabelError('Не найдены колонки «Название, Баркод, Артикул, Размер» — проверь файл.');
          return;
        }
        const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
        const cat = {}; // code -> { name, color, brand, sizes: { размер: баркод } }
        for (let i = hdr + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row) continue;
          const artFull = row[col.art], bar = row[col.bar], size = row[col.size];
          if (artFull == null || bar == null || size == null) continue;
          const code = String(artFull).trim().split(/\s+/)[0];
          if (!code) continue;
          if (!cat[code]) cat[code] = {
            name: cap(String(row[col.name] || '').trim()),
            color: col.color !== -1 ? cap(String(row[col.color] || '').trim()) : '',
            brand: col.brand !== -1 ? String(row[col.brand] || '').trim() : '',
            sizes: {}
          };
          const sz = String(size).trim();
          const bc = String(bar).trim();
          if (sz && bc && !cat[code].sizes[sz]) cat[code].sizes[sz] = bc;
        }
        if (Object.keys(cat).length === 0) {
          setLabelError('Артикулы не найдены в файле.');
          return;
        }
        setLabelError('');
        persist(KEY_CATALOG, cat, setCatalog);
      } catch (err) {
        setLabelError('Не удалось прочитать файл: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }
  async function generateLabelPDFs(selectedItems, opts = {}) {
    const items = selectedItems || labelSelected;
    const selected = items.map(({
      artStr,
      boxes
    }) => [artStr, boxes]).filter(([, v]) => v > 0);
    if (!selected.length) return;
    setGeneratingLabels(true);
    setLabelProgress('');
    try {
      const {
        jsPDF
      } = window.jspdf;
      const BOX = 8;
      const DPI = 300;
      const LW_mm = 58,
        LH_mm = 40;
      const LW_px = Math.round(LW_mm / 25.4 * DPI);
      const LH_px = Math.round(LH_mm / 25.4 * DPI);
      const MM = DPI / 25.4; // пикселей на мм

      function mmToPx(mm) {
        return Math.round(mm * MM);
      }
      async function renderLabel(name, artCode, size, barcode, color) {
        const cvs = document.createElement('canvas');
        cvs.width = LW_px;
        cvs.height = LH_px;
        const ctx = cvs.getContext('2d');

        // Canvas: Y=0 сверху, растёт вниз
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, LW_px, LH_px);
        ctx.fillStyle = '#000000';
        const ML = mmToPx(2.5);
        const PT = DPI / 72;

        // Текстовый блок: от 1.5мм сверху до 19.5мм (верхние ~18мм из 40мм)
        // Баркод: от 25мм до 37мм, цифры: 38.5мм
        const TEXT_START_Y = mmToPx(1.5); // отступ сверху
        const TEXT_END_Y = mmToPx(19.5); // нижняя граница текста
        const TEXT_H = TEXT_END_Y - TEXT_START_Y;
        const rowDefs = [
          { label: 'name', pt: 8.0 },
          { label: 'art', pt: 6.5 },
          { label: 'size', pt: 9.3 },
          { label: 'color', pt: 6.0 },
          { label: 'brand', pt: 6.0 },
          { label: 'ip', pt: 6.0 },
        ];
        const textFor = lbl => {
          if (lbl === 'name') return name || artCode;
          if (lbl === 'art') return `Артикул: ${artCode}`;
          if (lbl === 'size') return `Размер: ${size}`;
          if (lbl === 'color') return color ? `Цвет: ${color}` : '';
          if (lbl === 'brand') return 'Бренд: НОСИМ СУТКАМИ';
          if (lbl === 'ip') return 'ИП: Мукозобов Д.В.';
          return '';
        };
        // Пустые строки (например «Цвет», если цвета нет) убираем — иначе кривые отступы.
        const rows = rowDefs.filter(r => textFor(r.label) !== '');
        const rowH = pt => pt * PT; // полная высота строки в пикселях
        const totalH = rows.reduce((s, r) => s + rowH(r.pt), 0);
        const gap = rows.length > 1 ? (TEXT_H - totalH) / (rows.length - 1) : 0;
        const maxW = LW_px - ML * 2;
        let y = TEXT_START_Y;
        for (const r of rows) {
          let pt = r.pt;
          let text = textFor(r.label);
          ctx.font = `bold ${Math.round(pt * PT)}px Arial`;
          // Длинное название: сначала уменьшаем шрифт, чтобы влезло целиком.
          while (ctx.measureText(text).width > maxW && pt > 4.5) {
            pt -= 0.3;
            ctx.font = `bold ${Math.round(pt * PT)}px Arial`;
          }
          // Если даже на минимальном шрифте не влезает — аккуратно обрезаем с многоточием.
          if (ctx.measureText(text).width > maxW) {
            while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1);
            text += '…';
          }
          const textY = y + rowH(r.pt); // baseline = top + height
          if (r.label === 'name') ctx.fillText(text, (LW_px - ctx.measureText(text).width) / 2, textY);else ctx.fillText(text, ML, textY);
          y += rowH(r.pt) + gap;
        }

        // Баркод: от 25мм до 36.5мм
        const bcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bcSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        document.body.appendChild(bcSvg);
        window.JsBarcode(bcSvg, barcode, {
          format: 'CODE128',
          displayValue: false,
          width: 2.5,
          height: 80,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000'
        });
        const svgStr = new XMLSerializer().serializeToString(bcSvg);
        document.body.removeChild(bcSvg);
        const bcImg = new Image();
        const blobUrl = URL.createObjectURL(new Blob([svgStr], {
          type: 'image/svg+xml'
        }));
        await new Promise((res, rej) => {
          bcImg.onload = res;
          bcImg.onerror = rej;
          bcImg.src = blobUrl;
        });
        URL.revokeObjectURL(blobUrl);
        const bcW = LW_px - mmToPx(8); // отступ 4мм с каждой стороны
        const bcH = mmToPx(11.3);
        const bcX = (LW_px - bcW) / 2;
        const bcY = mmToPx(25); // баркод начинается с 25мм сверху
        ctx.drawImage(bcImg, bcX, bcY, bcW, bcH);

        // Цифры под баркодом
        const numPx = Math.round(5.7 * PT);
        ctx.font = `bold ${numPx}px Arial`;
        const numW = ctx.measureText(barcode).width;
        ctx.fillText(barcode, (LW_px - numW) / 2, mmToPx(38)); // 38мм сверху

        return cvs.toDataURL('image/png');
      }
      const combine = opts.combine; // объединить все артикулы в один PDF
      const returnBlobs = opts.returnBlobs; // вернуть массив [{code, blob}] — по PDF на артикул (для пакета ТЗ)
      const combinedDoc = combine ? new jsPDF({ unit: 'mm', format: [LW_mm, LH_mm], orientation: 'landscape' }) : null;
      let combinedFirst = true;
      const blobs = [];
      for (let idx = 0; idx < selected.length; idx++) {
        const [artStr, numBoxes] = selected[idx];
        const data = labelArticles[artStr];
        if (!data) continue; // артикула нет в каталоге — пропускаем
        setLabelProgress(`Генерирую ${idx + 1} из ${selected.length}: ${data.code}…`);
        await new Promise(r => setTimeout(r, 10));
        const totalQty = data.sizes.reduce((s, x) => s + x.qty, 0);
        if (!totalQty) continue;
        const refBoxes = totalQty / BOX;
        const doc = combine ? combinedDoc : new jsPDF({
          unit: 'mm',
          format: [LW_mm, LH_mm],
          orientation: 'landscape'
        });
        let first = combine ? combinedFirst : true;
        for (const s of [...data.sizes].sort((a, b) => a.size - b.size)) {
          const count = Math.round(s.qty / refBoxes * numBoxes);
          for (let n = 0; n < count; n++) {
            if (!first) doc.addPage([LW_mm, LH_mm], 'landscape');
            first = false;
            const imgData = await renderLabel(data.name, data.code, s.size, s.barcode, data.color);
            doc.addImage(imgData, 'PNG', 0, 0, LW_mm, LH_mm);
          }
        }
        if (combine) {
          combinedFirst = first;
        } else if (returnBlobs) {
          if (!first) blobs.push({ code: data.code, blob: doc.output('blob') });
        } else {
          doc.save(`этикетки_${data.code}.pdf`);
          await new Promise(r => setTimeout(r, 300));
        }
      }
      if (combine) {
        setLabelProgress('');
        if (combinedFirst) return null; // ни одной этикетки не получилось
        return opts.returnBlob ? combinedDoc.output('blob') : combinedDoc.save('этикетки.pdf');
      }
      if (returnBlobs) {
        setLabelProgress('');
        return blobs;
      }
      setLabelProgress(`Готово! Скачано ${selected.length} PDF файл(ов).`);
    } catch (e) {
      console.error(e);
      setLabelError('Ошибка генерации: ' + e.message);
    } finally {
      setGeneratingLabels(false);
    }
  }
  async function syncBarcodes(opts) {
    const silent = opts && opts.silent;
    if (WB_PROXY_URL.includes('YOUR-WORKER')) {
      if (!silent) setSyncError('Адрес сервиса синхронизации (WB_PROXY_URL) пока не настроен в коде сайта.');
      return;
    }
    setSyncingBarcodes(true);
    setSyncError('');
    try {
      const res = await fetch(WB_PROXY_URL);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const wbArticles = data.articles || {};
      // Нормализуем данные WB в каталог этикеток: ключ = код (первый токен артикула WB),
      // берём название, бренд и размеры → штрихкоды. Тот же формат, что каталог из Excel.
      const cat = {};
      for (const [vendorCode, v] of Object.entries(wbArticles)) {
        const code = String(vendorCode).trim().split(/\s+/)[0];
        if (!code) continue;
        if (!cat[code]) cat[code] = { name: (v && v.name) || '', color: '', brand: (v && v.brand) || '', category: (v && v.category) || '', sizes: {} };
        for (const [size, bc] of Object.entries((v && v.sizes) || {})) {
          if (bc && !cat[code].sizes[size]) cat[code].sizes[size] = String(bc);
        }
      }
      if (!Object.keys(cat).length) throw new Error('WB вернул пустой каталог.');
      await persist(KEY_CATALOG, cat, setCatalog);
      setBarcodesSyncedAt(data.syncedAt || new Date().toISOString());
      logAction(`Синхронизация с WB: ${Object.keys(cat).length} артикулов`, {});
    } catch (e) {
      console.error(e);
      if (!silent) setSyncError('Не удалось получить данные от WB: ' + (e.message || e));
    } finally {
      setSyncingBarcodes(false);
    }
  }
  // Момент последнего наступившего 9:00 по Москве (UTC+3, без перехода на летнее время).
  function lastMoscow9amMs() {
    const now = Date.now();
    const msk = new Date(now + 3 * 3600 * 1000); // «московские» часы в полях UTC
    let boundary = Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate(), 9, 0, 0) - 3 * 3600 * 1000;
    if (boundary > now) boundary -= 24 * 3600 * 1000; // сегодняшние 9:00 ещё не наступили → берём вчерашние
    return boundary;
  }
  // Авто-синхронизация с WB раз в сутки в 9:00 МСК: при открытии приложения и раз в 30 мин,
  // пока вкладка открыта, — если после ближайших 9:00 МСК синка ещё не было, запускаем тихо.
  const autoSyncRef = useRef(false);
  useEffect(() => {
    if (loading) return; // ждём, пока подтянутся данные из Supabase (в т.ч. время последнего синка)
    function maybeSync() {
      if (autoSyncRef.current) return;
      if (syncingBarcodes) return;
      const last = barcodesSyncedAt ? Date.parse(barcodesSyncedAt) : 0;
      if (!last || last < lastMoscow9amMs()) {
        autoSyncRef.current = true;
        syncBarcodes({ silent: true }).finally(() => { autoSyncRef.current = false; });
      }
    }
    maybeSync();
    const id = setInterval(maybeSync, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [loading, barcodesSyncedAt, syncingBarcodes]);
  function toggleLabelSelection(article, size) {
    const key = `${article}__${size}`;
    setLabelSelections(prev => {
      const next = _objectSpread({}, prev);
      if (next[key]) delete next[key];else next[key] = 1;
      return next;
    });
  }
  function setLabelQty(article, size, qty) {
    const key = `${article}__${size}`;
    setLabelSelections(prev => _objectSpread(_objectSpread({}, prev), {}, {
      [key]: Math.max(1, Number(qty) || 1)
    }));
  }
  function labelItems() {
    const items = [];
    Object.entries(labelSelections).forEach(([key, qty]) => {
      var _barcodes$article, _barcodes$article2;
      const sep = key.lastIndexOf('__');
      const article = key.slice(0, sep);
      const size = key.slice(sep + 2);
      const barcode = (_barcodes$article = barcodes[article]) === null || _barcodes$article === void 0 || (_barcodes$article = _barcodes$article.sizes) === null || _barcodes$article === void 0 ? void 0 : _barcodes$article[size];
      const name = ((_barcodes$article2 = barcodes[article]) === null || _barcodes$article2 === void 0 ? void 0 : _barcodes$article2.name) || names[article] || '';
      if (!barcode) return;
      for (let i = 0; i < qty; i++) {
        items.push({
          article,
          size,
          barcode,
          name
        });
      }
    });
    return items;
  }
  async function resetAllData() {
    if (!window.confirm('ВНИМАНИЕ: удалить АБСОЛЮТНО ВСЕ данные (приходы, отгрузки, брак, фотостудия, неопознанное, журнал действий, заявки ТЗ, склады, резервные копии)?\nЭто для тестирования и НЕОБРАТИМО.')) return;
    if (!window.confirm('Точно-точно? Все данные будут стёрты безвозвратно.')) return;
    await persist(KEY_INCOMES, [], setIncomes);
    await persist(KEY_SHIPMENTS, [], setShipments);
    await persist(KEY_DEFECTS, [], setDefects);
    await persist(KEY_PHOTO, [], setPhoto);
    await persist(KEY_UNIDENTIFIED, [], setUnidentified);
    await persist(KEY_NAMES, {}, setNames);
    await persist(KEY_ACTIONS, [], setActions);
    await persist(KEY_TZ_REQUESTS, [], setTzRequests);
    await persist(KEY_TZ_WAREHOUSES, [], setTzWarehouses);
    try {
      for (const b of backupList) await window.storage.delete(b.key);
      await window.storage.delete(KEY_LAST_BACKUP);
    } catch (e) {
      console.error(e);
    }
    setBackupList([]);
    alert('Готово. Все данные удалены.');
  }
  function deleteIncome(id) {
    persist(KEY_INCOMES, incomes.filter(i => i.id !== id), setIncomes);
  }
  function deleteShipment(id) {
    persist(KEY_SHIPMENTS, shipments.filter(s => s.id !== id), setShipments);
  }
  function deleteDefect(id) {
    persist(KEY_DEFECTS, defects.filter(d => d.id !== id), setDefects);
  }
  function deletePhoto(id) {
    persist(KEY_PHOTO, photo.filter(p => p.id !== id), setPhoto);
  }
  function deleteUnidentified(id) {
    persist(KEY_UNIDENTIFIED, unidentified.filter(u => u.id !== id), setUnidentified);
  }
  function guessHeader(headers, candidates) {
    const lower = headers.map(h => h.toLowerCase());
    for (const c of candidates) {
      const idx = lower.findIndex(h => h.includes(c));
      if (idx >= 0) return headers[idx];
    }
    return '';
  }
  function enrichDefectsWithPhoto(akteDefects, aktDate) {
    const photoAvail = photo.map(p => ({
      id: p.id,
      article: p.article,
      size: p.size,
      date: p.date,
      available: p.qty - (p.consumedQty || 0)
    }));
    return akteDefects.map(d => {
      let need = d.qty;
      let matched = 0;
      const consumption = [];
      for (const p of photoAvail) {
        if (need <= 0) break;
        // Брак часто без размера (пересорт), поэтому при неизвестном размере
        // сверяем только по артикулу. Дату не требуем: списать на фотостудию можно
        // и после получения акта (обычный рабочий порядок).
        const sizeOk = d.size === NO_SIZE || p.size === d.size;
        if (p.article === d.article && sizeOk && p.available > 0) {
          const take = Math.min(need, p.available);
          p.available -= take;
          matched += take;
          need -= take;
          consumption.push({
            id: p.id,
            amount: take
          });
        }
      }
      return _objectSpread(_objectSpread({}, d), {}, {
        matchedQty: matched,
        recordQty: Math.max(0, d.qty - matched),
        photoConsumption: consumption
      });
    });
  }
  function handleFile(e, kind) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, {
          type: 'array',
          cellDates: true
        });
        if (kind === 'shipment') {
          const akt = parseAkt(wb, file.name);
          if (akt) {
            const analysis = analyzeAkt(akt);
            const enrichedDefects = enrichDefectsWithPhoto(analysis.defects, akt.date);
            setAktPreview(_objectSpread(_objectSpread(_objectSpread({}, akt), analysis), {}, {
              defects: enrichedDefects
            }));
            return;
          }
        }
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: ''
        });
        const headers = (json[0] || []).map(h => String(h));
        const rows = json.slice(1).filter(r => r.some(c => c !== ''));
        const mapping = {};
        FIELD_DEFS[kind].forEach(f => {
          mapping[f.key] = guessHeader(headers, f.candidates);
        });
        setUploadPreview({
          kind,
          fileName: file.name,
          headers,
          rows,
          mapping,
          batchDate: todayISO()
        });
      } catch (err) {
        console.error(err);
        alert('Не получилось прочитать файл. Проверь, что это .xlsx или .csv');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }
  function parseDateCell(v) {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (v) {
      const s = String(v).trim();
      const dm = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})$/);
      if (dm) {
        const yyyy = dm[3].length === 2 ? '20' + dm[3] : dm[3];
        return `${yyyy}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}`;
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    }
    return todayISO();
  }
  function confirmUpload() {
    const {
      kind,
      headers,
      rows,
      mapping,
      fileName
    } = uploadPreview;
    const idx = {};
    Object.keys(mapping).forEach(k => {
      idx[k] = mapping[k] ? headers.indexOf(mapping[k]) : -1;
    });
    if (idx.article < 0 || idx.qty < 0) {
      alert('Укажи хотя бы колонки «Артикул» и «Количество»');
      return;
    }
    const entries = rows.map(r => {
      const base = {
        id: uid(),
        article: String(r[idx.article]).trim(),
        size: idx.size >= 0 && r[idx.size] !== '' ? String(r[idx.size]).trim() : NO_SIZE,
        qty: Number(r[idx.qty]) || 0,
        date: kind === 'income' ? uploadPreview.batchDate || todayISO() : idx.date >= 0 ? parseDateCell(r[idx.date]) : todayISO(),
        addedAt: new Date().toISOString(),
        fileName
      };
      if (kind === 'shipment') base.warehouse = idx.warehouse >= 0 ? String(r[idx.warehouse]).trim() : '';
      if (kind === 'income') base.note = '';
      return base;
    }).filter(e => e.article && e.qty);
    if (kind === 'income') {
      persist(KEY_INCOMES, [...incomes, ...entries], setIncomes);
      const totalQty = entries.reduce((s, e) => s + e.qty, 0);
      logAction(`Приход из файла «${fileName}»: ${entries.length} позиций, ${totalQty} шт.`, {
        incomes: entries.map(e => e.id)
      });
    } else {
      persist(KEY_SHIPMENTS, [...shipments, ...entries], setShipments);
      const totalQty = entries.reduce((s, e) => s + e.qty, 0);
      logAction(`Отгрузка из файла «${fileName}»: ${entries.length} позиций, ${totalQty} шт.`, {
        shipments: entries.map(e => e.id)
      });
    }
    setUploadPreview(null);
  }
  function confirmAkt() {
    const {
      shipmentNumber,
      date,
      totals,
      defects: defs,
      fileName,
      names: aktNames,
      unidentified: unidQty,
      unidentifiedNoArticle: unidNoArt = 0
    } = aktPreview;
    const shipEntries = totals.map(t => ({
      id: uid(),
      article: t.article,
      size: t.size || NO_SIZE,
      qty: t.qty,
      date,
      shipmentNumber,
      warehouse: '',
      fileName,
      addedAt: new Date().toISOString()
    }));
    // Обезличка = отгружено: пишем как отгрузку артикула короба (размер неизвестен).
    const uniShipEntries = (aktPreview.unidentifiedShipments || []).map(u => ({
      id: uid(),
      article: u.article,
      size: NO_SIZE,
      qty: u.qty,
      date,
      shipmentNumber,
      warehouse: '',
      fileName,
      note: 'обезличка (отгружено)',
      addedAt: new Date().toISOString()
    }));
    // Пересорт-коррекции: сводим артикулы к целым коробам (может быть отрицательным).
    const rebalanceEntries = (aktPreview.rebalanceShipments || []).map(u => ({
      id: uid(),
      article: u.article,
      size: NO_SIZE,
      qty: u.qty,
      date,
      shipmentNumber,
      warehouse: '',
      fileName,
      note: 'пересорт (коррекция до целых коробов)',
      addedAt: new Date().toISOString()
    }));
    const allShipEntries = [...shipEntries, ...uniShipEntries, ...rebalanceEntries];
    persist(KEY_SHIPMENTS, [...shipments, ...allShipEntries], setShipments);
    const toRecord = defs.filter(d => Number(d.recordQty) > 0);
    let defEntries = [];
    if (toRecord.length) {
      defEntries = toRecord.map(d => ({
        id: uid(),
        article: d.article,
        size: d.size || NO_SIZE,
        qty: Number(d.recordQty),
        date,
        shipmentNumber,
        note: `недостача в коробе · поставка №${shipmentNumber}`,
        addedAt: new Date().toISOString()
      }));
      persist(KEY_DEFECTS, [...defects, ...defEntries], setDefects);
    }

    // Помечаем списания для фотостудии, которые объясняют часть недостачи, как использованные
    const consumeMap = {};
    defs.forEach(d => {
      (d.photoConsumption || []).forEach(c => {
        consumeMap[c.id] = (consumeMap[c.id] || 0) + c.amount;
      });
    });
    if (Object.keys(consumeMap).length) {
      const updatedPhoto = photo.map(p => consumeMap[p.id] ? _objectSpread(_objectSpread({}, p), {}, {
        consumedQty: (p.consumedQty || 0) + consumeMap[p.id]
      }) : p);
      persist(KEY_PHOTO, updatedPhoto, setPhoto);
    }
    // Обезличка без короба/артикула — отдельная запись. Обезличка с коробом уже
    // записана как отгрузка (note 'обезличка …'); счётчик «Обезличка» суммирует и то,
    // и другое из данных, поэтому здесь дублировать её не нужно.
    let unidEntry = null;
    if (unidNoArt > 0) {
      unidEntry = {
        id: uid(),
        qty: unidNoArt,
        date,
        shipmentNumber,
        note: `обезличка без короба/артикула · поставка №${shipmentNumber}`,
        addedAt: new Date().toISOString()
      };
      persist(KEY_UNIDENTIFIED, [...unidentified, unidEntry], setUnidentified);
    }
    if (aktNames && Object.keys(aktNames).length) {
      persist(KEY_NAMES, _objectSpread(_objectSpread({}, names), aktNames), setNames);
    }
    const totalQty = allShipEntries.reduce((s, e) => s + e.qty, 0);
    const uniShipQty = uniShipEntries.reduce((s, e) => s + e.qty, 0);
    const defQty = toRecord.reduce((s, d) => s + Number(d.recordQty), 0);
    const unidTotal = uniShipQty + unidNoArt;
    let label = `Акт приёмки №${shipmentNumber} от ${fmtDate(date)}: отгружено ${totalQty} шт.`;
    if (defQty > 0) label += `, брак ${defQty} шт.`;
    if (unidTotal > 0) label += `, обезличка ${unidTotal} шт.`;
    const refs = {
      shipments: allShipEntries.map(e => e.id)
    };
    if (defEntries.length) refs.defects = defEntries.map(e => e.id);
    if (unidEntry) refs.unidentified = [unidEntry.id];
    // Если акт загружали из ТЗ — переводим его в «Отгружено» (списан с «принимается WB»).
    if (aktTzId) { updateTzStatus(aktTzId, 'done'); setAktTzId(null); }
    setAktPreview(null);
    logAction(label, refs);
  }
  function updateAktDefectQty(index, value) {
    setAktPreview(prev => _objectSpread(_objectSpread({}, prev), {}, {
      defects: prev.defects.map((d, i) => i === index ? _objectSpread(_objectSpread({}, d), {}, {
        recordQty: value
      }) : d)
    }));
  }
  function exportBackup() {
    const payload = {
      incomes,
      shipments,
      defects,
      photo,
      unidentified,
      names,
      tzRequests,
      tzWarehouses,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sklad-backup_${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.incomes) persist(KEY_INCOMES, data.incomes, setIncomes);
        if (data.shipments) persist(KEY_SHIPMENTS, data.shipments, setShipments);
        if (data.defects) persist(KEY_DEFECTS, data.defects, setDefects);
        if (data.photo) persist(KEY_PHOTO, data.photo, setPhoto);
        if (data.unidentified) persist(KEY_UNIDENTIFIED, data.unidentified, setUnidentified);
        if (data.names) persist(KEY_NAMES, data.names, setNames);
        if (data.tzRequests) persist(KEY_TZ_REQUESTS, data.tzRequests, setTzRequests);
        if (data.tzWarehouses) persist(KEY_TZ_WAREHOUSES, data.tzWarehouses, setTzWarehouses);
      } catch (err) {
        console.error(err);
        alert('Не получилось прочитать файл резервной копии — проверь, что это .json, сохранённый этим инструментом.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  // Двойные артикулы: строка вида «283-7 = D6167-8P» — один товар под двумя кодами.
  // Строим индекс: каждый код -> каноничная (двойная) строка. Любой одиночный код,
  // совпадающий с частью двойного, сводится к тому же артикулу (не плодим дубли/минус).
  const aliasIndex = useMemo(() => {
    const idx = {};
    [...incomes, ...shipments, ...defects, ...photo].forEach(it => {
      const a = (it.article || '').trim();
      if (a.includes('=')) a.split(/\s*=\s*/).map(s => s.trim()).filter(Boolean).forEach(c => { idx[c] = a; });
    });
    return idx;
  }, [incomes, shipments, defects, photo]);
  const canonArticle = a => {
    a = (a || '').trim();
    if (!a || a.includes('=')) return a;
    return aliasIndex[a] || a;
  };
  const summary = useMemo(() => {
    const articleMap = {};
    const ensure = article => {
      if (!articleMap[article]) articleMap[article] = {
        article,
        income: 0,
        shipped: 0,
        defect: 0,
        photo: 0,
        inWork: 0,
        toWb: 0,
        sizes: {}
      };
      return articleMap[article];
    };
    const ensureSize = (a, size) => {
      const key = size || NO_SIZE;
      if (!a.sizes[key]) a.sizes[key] = {
        size: key,
        income: 0,
        shipped: 0,
        defect: 0,
        photo: 0
      };
      return a.sizes[key];
    };
    incomes.forEach(i => {
      const a = ensure(canonArticle(i.article));
      a.income += i.qty;
      ensureSize(a, i.size).income += i.qty;
    });
    shipments.forEach(s => {
      const a = ensure(canonArticle(s.article));
      a.shipped += s.qty;
      ensureSize(a, s.size).shipped += s.qty;
    });
    defects.forEach(d => {
      const a = ensure(canonArticle(d.article));
      a.defect += d.qty;
      ensureSize(a, d.size).defect += d.qty;
    });
    photo.forEach(p => {
      const a = ensure(canonArticle(p.article));
      a.photo += p.qty;
      ensureSize(a, p.size).photo += p.qty;
    });
    // Резерв под ТЗ: 'in_progress' = «в работе», 'shipping' = «принимается складом WB».
    // Оба выводятся из доступного остатка (товар ещё не отгружён актом, но уже расписан).
    tzRequests.forEach(t => {
      const bucket = t.status === 'in_progress' ? 'inWork' : (t.status === 'shipping' ? 'toWb' : null);
      if (!bucket) return;
      (t.rows || []).forEach(row => {
        const qty = Number(row.qty) || 0;
        if (qty <= 0) return;
        ensure(canonArticle(row.article))[bucket] += qty;
      });
    });
    return Object.values(articleMap).map(a => _objectSpread(_objectSpread({}, a), {}, {
      // Физический остаток (что лежит на складе) и доступный (за вычетом резерва под ТЗ).
      physical: a.income - a.shipped - a.defect - a.photo,
      balance: a.income - a.shipped - a.defect - a.photo - a.inWork - a.toWb,
      sizes: Object.values(a.sizes).map(sz => _objectSpread(_objectSpread({}, sz), {}, {
        balance: sz.income - sz.shipped - sz.defect - sz.photo
      })).sort((x, y) => x.size.localeCompare(y.size, undefined, {
        numeric: true
      }))
    })).sort((a, b) => a.article.localeCompare(b.article, undefined, {
      numeric: true
    }));
  }, [incomes, shipments, defects, photo, tzRequests]);
  // Данные для этикеток: содержимое (имя, штрихкод, цвет, размеры) — из каталога,
  // количество по размерам — из остатка склада. Так раздел «Этикетки» и кнопка
  // «Скачать для работы» берут всё из одного сохранённого каталога.
  useEffect(() => {
    const out = {};
    for (const code of Object.keys(catalog)) {
      const c = catalog[code];
      const stock = summary.find(s => s.article === canonArticle(code));
      out[code] = {
        code,
        name: c.name || '',
        color: c.color || '',
        sizes: Object.keys(c.sizes || {}).map(size => {
          const sz = stock && stock.sizes.find(x => String(x.size) === String(size));
          const num = parseInt(size);
          return {
            size: isNaN(num) ? size : num,
            barcode: String(c.sizes[size]),
            qty: sz ? sz.income : 0
          };
        })
      };
    }
    setLabelArticles(out);
  }, [catalog, summary]);
  const photoArticleOptions = useMemo(() => summary.map(s => s.article), [summary]);
  useEffect(() => {
    if (!photoArticleOptions.length) return;
    setPhotoItems(prev => prev.map(it => {
      if (it.article && photoArticleOptions.includes(it.article)) return it;
      const article = photoArticleOptions[0];
      const found = summary.find(s => s.article === article);
      const sizes = found ? found.sizes.map(sz => sz.size) : [];
      return _objectSpread(_objectSpread({}, it), {}, {
        article,
        size: sizes[0] || ''
      });
    }));
  }, [photoArticleOptions]);
  useEffect(() => {
    if (!photoArticleOptions.length) return;
    setTzItems(prev => prev.map(it => it.article && photoArticleOptions.includes(it.article) ? it : _objectSpread(_objectSpread({}, it), {}, {
      article: photoArticleOptions[0]
    })));
  }, [photoArticleOptions]);
  function balanceForArticle(article) {
    const found = summary.find(s => s.article === canonArticle(article));
    return found ? found.balance : 0;
  }
  // --- Размерная сетка по артикулу (какие размеры задвоены ×2) ---
  function articleCode(a) { return String(a || '').trim().split(/\s+/)[0]; }
  // Коды артикула: для двойного «D1020-3 = 129-5» — оба (первый токен каждой части).
  function articleCodes(a) {
    return String(a || '').split(/\s*=\s*/).map(p => p.trim().split(/\s+/)[0]).filter(Boolean);
  }
  // Запись каталога по любому из кодов двойного артикула.
  function catalogEntry(a) {
    for (const code of articleCodes(a)) { if (catalog[code]) return catalog[code]; }
    return null;
  }
  function articleCategory(a) { const c = catalogEntry(a); return (c && c.category) || ''; }
  function articleAllSizes(a) {
    // размеры артикула: из каталога WB (по любому коду) или из остатка
    const cat = catalogEntry(a);
    if (cat && cat.sizes && Object.keys(cat.sizes).length) {
      return Object.keys(cat.sizes).sort((x, y) => (Number(x) || 0) - (Number(y) || 0));
    }
    const s = summary.find(x => x.article === canonArticle(a));
    return s ? s.sizes.map(z => String(z.size)).filter(z => z !== NO_SIZE)
      .sort((x, y) => (Number(x) || 0) - (Number(y) || 0)) : [];
  }
  // Раскладка короба: code -> {size: 0|1|2} (нет / ×1 / ×2). Старый формат
  // (массив задвоенных размеров) читаем как совместимость: перечисленные = ×2.
  function gridCounts(a) {
    const raw = grids[articleCode(a)];
    const sizes = articleAllSizes(a);
    const counts = {};
    if (Array.isArray(raw)) {
      sizes.forEach(sz => { counts[String(sz)] = raw.includes(String(sz)) ? 2 : 1; });
    } else if (raw && typeof raw === 'object') {
      sizes.forEach(sz => { counts[String(sz)] = (String(sz) in raw) ? raw[String(sz)] : 1; });
    } else {
      sizes.forEach(sz => { counts[String(sz)] = 1; });
    }
    return counts;
  }
  function gridDefined(a) { return articleCode(a) in grids; }
  // Клик по размеру циклит ×1 → ×2 → нет → ×1. Сохраняем полную карту счётчиков.
  function cycleGridSize(a, size) {
    const code = articleCode(a);
    const counts = gridCounts(a);
    const sz = String(size);
    const cur = (sz in counts) ? counts[sz] : 1;
    counts[sz] = cur === 1 ? 2 : (cur === 2 ? 0 : 1);
    persist(KEY_GRIDS, _objectSpread(_objectSpread({}, grids), {}, { [code]: counts }), setGrids);
  }
  function gridSum(a) {
    return Object.values(gridCounts(a)).reduce((s, c) => s + c, 0);
  }
  // Вектор пар на короб ({size: count>0}) или null, если сетка не задана / сумма ≠ 8.
  function gridVector(a) {
    if (!gridDefined(a)) return null;
    const counts = gridCounts(a);
    if (!Object.keys(counts).length) return null;
    const vec = {};
    let sum = 0;
    Object.entries(counts).forEach(([sz, c]) => { if (c > 0) vec[sz] = c; sum += c; });
    return sum === BOX_SIZE ? vec : null;
  }
  // Редактор размерной сетки: кнопки размеров (клик циклит нет → ×1 → ×2) + сумма/8.
  function sizeGridEditor(article) {
    const sizes = articleAllSizes(article);
    if (!sizes.length) {
      return /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: 'var(--ink-soft)' } },
        "Нет размеров в каталоге WB для этого артикула — синхронизируй каталог или проверь код.");
    }
    const counts = gridCounts(article);
    const sum = gridSum(article);
    return /*#__PURE__*/React.createElement("div", null,
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        sizes.map(sz => {
          const c = counts[String(sz)];
          const isAbs = c === 0, isDbl = c === 2;
          return /*#__PURE__*/React.createElement("button", {
            key: sz, className: "skl-btn skl-btn-ghost",
            style: {
              padding: '6px 12px',
              borderColor: isDbl ? 'var(--accent)' : (isAbs ? 'var(--line)' : 'var(--line)'),
              color: isAbs ? 'var(--ink-soft)' : (isDbl ? 'var(--accent)' : 'var(--ink)'),
              fontWeight: isDbl ? 700 : 500,
              opacity: isAbs ? 0.5 : 1,
              textDecoration: isAbs ? 'line-through' : 'none'
            },
            onClick: () => cycleGridSize(article, sz)
          }, sz, isAbs ? ' · нет' : (isDbl ? ' ×2' : ' ×1'));
        })),
      /*#__PURE__*/React.createElement("div", {
        style: { fontSize: 12.5, marginTop: 8, color: sum === BOX_SIZE ? 'var(--positive)' : 'var(--warn)' }
      }, "Сумма: ", sum, " / ", BOX_SIZE, sum === BOX_SIZE ? " ✓" : " — клик по размеру: нет / ×1 / ×2, чтобы вышло 8"));
  }
  // Авто-заполнение сеток из приходов: размерный ряд = распределение прихода по размерам
  // на короб (8). Размеры, которым достаётся ×2, помечаем задвоенными.
  function autofillGrids() {
    const next = _objectSpread({}, grids);
    let filled = 0;
    summary.forEach(s => {
      const code = articleCode(s.article);
      const sizes = s.sizes
        .filter(z => String(z.size) !== NO_SIZE && z.income > 0)
        .sort((a, b) => (Number(a.size) || 0) - (Number(b.size) || 0));
      if (sizes.length < 2) return;
      const total = sizes.reduce((t, z) => t + z.income, 0);
      if (total <= 0) return;
      const raw = sizes.map(z => z.income / total * BOX_SIZE);
      const res = raw.map(x => Math.floor(x));
      const order = raw.map((x, i) => ({ i, f: x - Math.floor(x) })).sort((a, b) => b.f - a.f);
      let g = 0;
      while (res.reduce((a, b) => a + b, 0) < BOX_SIZE && g < 50) { res[order[g % order.length].i]++; g++; }
      // Полная карта счётчиков: размеры без прихода = 0 (нет в коробе).
      const counts = {};
      articleAllSizes(s.article).forEach(sz => { counts[String(sz)] = 0; });
      sizes.forEach((z, i) => { counts[String(z.size)] = res[i]; });
      next[code] = counts;
      filled++;
    });
    persist(KEY_GRIDS, next, setGrids);
    alert(`Готово! Сетки заполнены для ${filled} артикулов (из приходов). Проверь в остатках и подправь, где нужно.`);
  }
  // Вся обезличка = записи без короба (unidentified) + отгрузки-обезлички (по пометке).
  const obezlichkaShipped = useMemo(() =>
    shipments.filter(s => typeof s.note === 'string' && s.note.startsWith('обезличка')).reduce((a, s) => a + s.qty, 0),
    [shipments]);
  const totals = useMemo(() => ({
    sku: summary.length,
    income: summary.reduce((s, x) => s + x.income, 0),
    shipped: summary.reduce((s, x) => s + x.shipped, 0),
    defect: summary.reduce((s, x) => s + x.defect, 0),
    photo: summary.reduce((s, x) => s + x.photo, 0),
    unidentified: unidentified.reduce((s, u) => s + u.qty, 0) + obezlichkaShipped,
    balance: summary.reduce((s, x) => s + x.balance, 0)
  }), [summary, unidentified, obezlichkaShipped]);
  const defectStats = useMemo(() => {
    const map = {};
    defects.forEach(d => {
      const key = `${d.article}__${d.size || NO_SIZE}`;
      if (!map[key]) map[key] = {
        article: d.article,
        size: d.size || NO_SIZE,
        qty: 0,
        count: 0
      };
      map[key].qty += d.qty;
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [defects]);
  const shipmentList = useMemo(() => {
    const map = {};
    shipments.forEach(s => {
      const num = s.shipmentNumber || '—';
      if (!map[num]) map[num] = {
        number: num,
        date: s.date,
        total: 0,
        defectTotal: 0,
        items: []
      };
      map[num].total += s.qty;
      if (s.date && s.date > map[num].date) map[num].date = s.date;
      map[num].items.push(_objectSpread(_objectSpread({}, s), {}, {
        type: 'shipment'
      }));
    });
    defects.forEach(d => {
      const num = d.shipmentNumber || '—';
      if (!map[num]) map[num] = {
        number: num,
        date: d.date,
        total: 0,
        defectTotal: 0,
        items: []
      };
      map[num].defectTotal += d.qty;
      if (d.date && d.date > map[num].date) map[num].date = d.date;
      map[num].items.push(_objectSpread(_objectSpread({}, d), {}, {
        type: 'defect'
      }));
    });
    return Object.values(map).sort((a, b) => a.date < b.date ? 1 : -1);
  }, [shipments, defects]);
  const filteredShipmentList = useMemo(() => {
    const q = searchShipment.trim();
    if (!q) return shipmentList;
    return shipmentList.filter(s => s.number.includes(q));
  }, [shipmentList, searchShipment]);
  function setStatsPreset(days) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    setStatsFrom(from.toISOString().slice(0, 10));
    setStatsTo(to.toISOString().slice(0, 10));
  }
  const periodStats = useMemo(() => {
    const inRange = d => d >= statsFrom && d <= statsTo;
    const numbers = new Set();
    shipments.forEach(s => {
      if (inRange(s.date) && s.shipmentNumber) numbers.add(s.shipmentNumber);
    });
    return {
      shipped: shipments.filter(s => inRange(s.date)).reduce((a, s) => a + s.qty, 0),
      income: incomes.filter(i => inRange(i.date)).reduce((a, i) => a + i.qty, 0),
      defect: defects.filter(d => inRange(d.date)).reduce((a, d) => a + d.qty, 0),
      photo: photo.filter(p => inRange(p.date)).reduce((a, p) => a + p.qty, 0),
      unidentified: unidentified.filter(u => inRange(u.date)).reduce((a, u) => a + u.qty, 0)
        + shipments.filter(s => inRange(s.date) && typeof s.note === 'string' && s.note.startsWith('обезличка')).reduce((a, s) => a + s.qty, 0),
      shipmentsCount: numbers.size
    };
  }, [shipments, incomes, defects, photo, unidentified, statsFrom, statsTo]);
  function exportExcel() {
    const data = [];
    summary.forEach(s => {
      s.sizes.forEach(sz => {
        data.push({
          'Артикул': s.article,
          'Название': names[s.article] || '',
          'Размер': sz.size === NO_SIZE ? '' : sz.size,
          'Приход': sz.income,
          'Брак': sz.defect,
          'Фотостудия': sz.photo,
          'Отгружено': sz.shipped,
          'Остаток': sz.balance
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Остатки');
    if (totals.unidentified > 0) {
      const wsU = XLSX.utils.json_to_sheet(unidentified.map(u => ({
        'Дата': u.date,
        'Поставка': u.shipmentNumber || '',
        'Кол-во': u.qty,
        'Комментарий': u.note || ''
      })));
      XLSX.utils.book_append_sheet(wb, wsU, 'Неопознанный товар');
    }
    XLSX.writeFile(wb, `ostatki_${todayISO()}.xlsx`);
  }
  // Экспорт данных конкретной плитки дашборда (только приход / только брак и т.д.).
  function exportMetric(kind) {
    const sz = s => s === NO_SIZE ? '' : s;
    let rows = [], sheet = 'Данные', file = 'export';
    if (kind === 'sku') {
      rows = summary.map(s => ({ 'Артикул': s.article, 'Название': names[s.article] || '', 'Категория': articleCategory(s.article), 'Остаток, шт.': s.balance }));
      sheet = 'Артикулы'; file = 'artikuly';
    } else if (kind === 'income') {
      rows = incomes.map(i => ({ 'Дата': i.date, 'Артикул': i.article, 'Размер': sz(i.size), 'Кол-во, шт.': i.qty, 'Комментарий': i.note || '' }));
      sheet = 'Приход'; file = 'prihod';
    } else if (kind === 'defect') {
      rows = defects.map(d => ({ 'Дата': d.date, 'Артикул': d.article, 'Размер': sz(d.size), 'Кол-во, шт.': d.qty, 'Поставка': d.shipmentNumber || '', 'Комментарий': d.note || '' }));
      sheet = 'Брак'; file = 'brak';
    } else if (kind === 'photo') {
      rows = photo.map(p => ({ 'Дата': p.date, 'Артикул': p.article, 'Размер': sz(p.size), 'Кол-во, шт.': p.qty, 'Комментарий': p.note || '' }));
      sheet = 'Фотостудия'; file = 'fotostudiya';
    } else if (kind === 'unidentified') {
      const obez = shipments.filter(s => typeof s.note === 'string' && s.note.startsWith('обезличка'))
        .map(s => ({ 'Дата': s.date, 'Артикул': s.article, 'Поставка': s.shipmentNumber || '', 'Кол-во, шт.': s.qty, 'Комментарий': s.note }));
      const uni = unidentified.map(u => ({ 'Дата': u.date, 'Артикул': '', 'Поставка': u.shipmentNumber || '', 'Кол-во, шт.': u.qty, 'Комментарий': u.note || '' }));
      rows = [...obez, ...uni];
      sheet = 'Обезличка'; file = 'obezlichka';
    } else if (kind === 'shipped') {
      rows = shipments.map(s => ({ 'Дата': s.date, 'Артикул': s.article, 'Размер': sz(s.size), 'Кол-во, шт.': s.qty, 'Поставка': s.shipmentNumber || '', 'Комментарий': s.note || '' }));
      sheet = 'Отгружено'; file = 'otgruzheno';
    } else if (kind === 'balance') {
      summary.forEach(s => s.sizes.forEach(z => rows.push({ 'Артикул': s.article, 'Размер': sz(z.size), 'Остаток, шт.': z.balance })));
      sheet = 'Остаток'; file = 'ostatok';
    }
    if (!rows.length) { alert('Нет данных для выгрузки.'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheet);
    XLSX.writeFile(wb, `${file}_${todayISO()}.xlsx`);
  }
  function historyFor(article) {
    const ins = incomes.filter(i => i.article === article).map(i => _objectSpread(_objectSpread({}, i), {}, {
      type: 'income'
    }));
    const outs = shipments.filter(s => s.article === article).map(s => _objectSpread(_objectSpread({}, s), {}, {
      type: 'shipment'
    }));
    const defs = defects.filter(d => d.article === article).map(d => _objectSpread(_objectSpread({}, d), {}, {
      type: 'defect'
    }));
    const phs = photo.filter(p => p.article === article).map(p => _objectSpread(_objectSpread({}, p), {}, {
      type: 'photo'
    }));
    return [...ins, ...outs, ...defs, ...phs].sort((a, b) => a.date < b.date ? 1 : -1);
  }
  // ---- данные для дашборда ----
  const dashTop = useMemo(() => [...summary].sort((a, b) => b.balance - a.balance).slice(0, 6), [summary]);
  const dashWeekly = useMemo(() => {
    const weeks = 8, msWeek = 7 * 24 * 3600 * 1000;
    const start = Date.now() - (weeks - 1) * msWeek;
    const buckets = Array.from({ length: weeks }, () => ({ inc: 0, shp: 0 }));
    const put = (arr, key) => arr.forEach(x => {
      const t = new Date(x.date).getTime();
      if (isNaN(t)) return;
      const i = Math.floor((t - start) / msWeek);
      if (i >= 0 && i < weeks) buckets[i][key] += x.qty || 0;
    });
    put(incomes, 'inc'); put(shipments, 'shp');
    return buckets;
  }, [incomes, shipments]);
  const dashChart = useMemo(() => {
    const W = 330, H = 120, pad = 8, n = dashWeekly.length;
    const max = Math.max(1, ...dashWeekly.map(b => b.inc), ...dashWeekly.map(b => b.shp));
    const X = i => pad + (W - 2 * pad) * (n <= 1 ? 0 : i / (n - 1));
    const Y = v => H - 8 - (H - 34) * (v / max);
    const ln = key => dashWeekly.map((b, i) => `${X(i).toFixed(1)},${Y(b[key]).toFixed(1)}`).join(' ');
    const inc = ln('inc'), shp = ln('shp');
    const area = `${inc} ${X(n - 1).toFixed(1)},${H - 2} ${X(0).toFixed(1)},${H - 2}`;
    return { inc, shp, area, empty: max <= 1 };
  }, [dashWeekly]);
  const dashDonut = useMemo(() => {
    const b = Math.max(0, totals.balance), s = Math.max(0, totals.shipped), d = Math.max(0, totals.defect);
    const sum = b + s + d || 1, C = 251.3, seg = v => (v / sum) * C;
    return { segB: seg(b), segS: seg(s), segD: seg(d),
      pctB: Math.round(b / sum * 100), pctS: Math.round(s / sum * 100), pctD: Math.round(d / sum * 100) };
  }, [totals]);
  const maxBalance = Math.max(1, ...dashTop.map(a => a.balance));
  const dashRecent = actions.slice(0, 6);
  const svgIcon = children => /*#__PURE__*/React.createElement("svg", {
    width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round"
  }, children);
  const navItems = [
    { key: 'dashboard', label: 'Дашборд', icon: svgIcon([
      /*#__PURE__*/React.createElement("rect", { key: 1, x: 3, y: 3, width: 7, height: 9, rx: 1 }),
      /*#__PURE__*/React.createElement("rect", { key: 2, x: 14, y: 3, width: 7, height: 5, rx: 1 }),
      /*#__PURE__*/React.createElement("rect", { key: 3, x: 14, y: 12, width: 7, height: 9, rx: 1 }),
      /*#__PURE__*/React.createElement("rect", { key: 4, x: 3, y: 16, width: 7, height: 5, rx: 1 }) ]) },
    { key: 'main', label: 'Остатки', icon: /*#__PURE__*/React.createElement(Box, { size: 17 }) },
    { key: 'receiving', label: 'Приёмка машин', icon: svgIcon([
      /*#__PURE__*/React.createElement("path", { key: 1, d: "M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" }),
      /*#__PURE__*/React.createElement("path", { key: 2, d: "M14 9h4l3 3v5a1 1 0 0 1-1 1h-1" }),
      /*#__PURE__*/React.createElement("circle", { key: 3, cx: 7, cy: 18, r: 2 }),
      /*#__PURE__*/React.createElement("circle", { key: 4, cx: 17, cy: 18, r: 2 }) ]) },
    { key: 'tz', label: 'ТЗ на отгрузку', icon: /*#__PURE__*/React.createElement(ClipboardList, { size: 17 }) },
    ...(role === 'fulfillment' ? [{ key: 'labels', label: 'Этикетки', icon: /*#__PURE__*/React.createElement(Tag, { size: 17 }) }] : []),
    { key: 'reports', label: 'Отчёты', icon: svgIcon([
      /*#__PURE__*/React.createElement("path", { key: 1, d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
      /*#__PURE__*/React.createElement("polyline", { key: 2, points: "14 2 14 8 20 8" }),
      /*#__PURE__*/React.createElement("line", { key: 3, x1: 16, y1: 13, x2: 8, y2: 13 }),
      /*#__PURE__*/React.createElement("line", { key: 4, x1: 16, y1: 17, x2: 8, y2: 17 }) ]) },
  ];
  const pageTitle = (navItems.find(n => n.key === activeTab) || navItems[0]).label;
  const dot = c => /*#__PURE__*/React.createElement("span", { style: { color: c } }, "● ");
  const dashboardCharts = /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 13, marginBottom: 13 } },
      /*#__PURE__*/React.createElement("div", { className: "skl-card" },
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
          /*#__PURE__*/React.createElement("div", { className: "skl-display", style: { fontSize: 14, fontWeight: 600 } }, "Движение за 8 недель"),
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-soft)' } },
            /*#__PURE__*/React.createElement("span", null, dot('var(--accent)'), "Приход"),
            /*#__PURE__*/React.createElement("span", null, dot('var(--positive)'), "Отгрузка"))),
        dashChart.empty
          ? /*#__PURE__*/React.createElement("div", { style: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', fontSize: 13 } }, "Пока нет данных для графика")
          : /*#__PURE__*/React.createElement("svg", { viewBox: "0 0 330 120", style: { width: '100%', height: 'auto' } },
              /*#__PURE__*/React.createElement("line", { x1: 0, y1: 30, x2: 330, y2: 30, stroke: "var(--line)", strokeWidth: 1 }),
              /*#__PURE__*/React.createElement("line", { x1: 0, y1: 60, x2: 330, y2: 60, stroke: "var(--line)", strokeWidth: 1 }),
              /*#__PURE__*/React.createElement("line", { x1: 0, y1: 90, x2: 330, y2: 90, stroke: "var(--line)", strokeWidth: 1 }),
              /*#__PURE__*/React.createElement("polygon", { points: dashChart.area, fill: "var(--accent)", opacity: 0.13 }),
              /*#__PURE__*/React.createElement("polyline", { points: dashChart.inc, fill: "none", stroke: "var(--accent)", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }),
              /*#__PURE__*/React.createElement("polyline", { points: dashChart.shp, fill: "none", stroke: "var(--positive)", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }))),
      /*#__PURE__*/React.createElement("div", { className: "skl-card" },
        /*#__PURE__*/React.createElement("div", { className: "skl-display", style: { fontSize: 14, fontWeight: 600, marginBottom: 8 } }, "Структура"),
        /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          /*#__PURE__*/React.createElement("svg", { viewBox: "0 0 100 100", width: 92, height: 92 },
            /*#__PURE__*/React.createElement("circle", { cx: 50, cy: 50, r: 40, fill: "none", stroke: "var(--card-2)", strokeWidth: 14 }),
            /*#__PURE__*/React.createElement("circle", { cx: 50, cy: 50, r: 40, fill: "none", stroke: "var(--accent)", strokeWidth: 14, strokeDasharray: `${dashDonut.segB} 251.3`, transform: "rotate(-90 50 50)" }),
            /*#__PURE__*/React.createElement("circle", { cx: 50, cy: 50, r: 40, fill: "none", stroke: "var(--positive)", strokeWidth: 14, strokeDasharray: `${dashDonut.segS} 251.3`, strokeDashoffset: -dashDonut.segB, transform: "rotate(-90 50 50)" }),
            /*#__PURE__*/React.createElement("circle", { cx: 50, cy: 50, r: 40, fill: "none", stroke: "var(--negative)", strokeWidth: 14, strokeDasharray: `${dashDonut.segD} 251.3`, strokeDashoffset: -(dashDonut.segB + dashDonut.segS), transform: "rotate(-90 50 50)" })),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 11.5, lineHeight: 1.9, color: 'var(--ink)' } },
            /*#__PURE__*/React.createElement("div", null, dot('var(--accent)'), "Остаток ", dashDonut.pctB, "%"),
            /*#__PURE__*/React.createElement("div", null, dot('var(--positive)'), "Отгружено ", dashDonut.pctS, "%"),
            /*#__PURE__*/React.createElement("div", null, dot('var(--negative)'), "Брак ", dashDonut.pctD, "%"))))),
    /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 20 } },
      /*#__PURE__*/React.createElement("div", { className: "skl-card" },
        /*#__PURE__*/React.createElement("div", { className: "skl-display", style: { fontSize: 14, fontWeight: 600, marginBottom: 11 } }, "Топ артикулов по остатку"),
        dashTop.length === 0
          ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--ink-soft)', fontSize: 13 } }, "Пока пусто")
          : /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
              dashTop.map((a, i) => /*#__PURE__*/React.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: 9 } },
                /*#__PURE__*/React.createElement("span", { className: "skl-mono", style: { fontSize: 11.5, color: 'var(--accent)', width: 74, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, a.article),
                /*#__PURE__*/React.createElement("div", { style: { flex: 1, height: 6, background: 'var(--card-2)', borderRadius: 3, overflow: 'hidden' } },
                  /*#__PURE__*/React.createElement("div", { style: { width: `${Math.max(4, Math.round(a.balance / maxBalance * 100))}%`, height: '100%', background: 'var(--accent)' } })),
                /*#__PURE__*/React.createElement("span", { style: { fontSize: 11.5, color: 'var(--ink-soft)', width: 46, textAlign: 'right' } }, a.balance))))),
      /*#__PURE__*/React.createElement("div", { className: "skl-card" },
        /*#__PURE__*/React.createElement("div", { className: "skl-display", style: { fontSize: 14, fontWeight: 600, marginBottom: 11 } }, "Последние операции"),
        dashRecent.length === 0
          ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--ink-soft)', fontSize: 13 } }, "Действий пока нет")
          : /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12 } },
              dashRecent.map((a, i) => /*#__PURE__*/React.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: 9 } },
                /*#__PURE__*/React.createElement("span", { style: { width: 6, height: 6, borderRadius: 3, background: 'var(--accent)', flex: 'none' } }),
                /*#__PURE__*/React.createElement("div", { style: { flex: 1, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, a.label),
                /*#__PURE__*/React.createElement("span", { style: { color: 'var(--ink-soft)', flex: 'none' } }, fmtDate(a.date))))))));
  const recvField = (label, input, extra) => /*#__PURE__*/React.createElement("label", {
    style: Object.assign({ display: 'block' }, extra || {})
  }, /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: 'var(--ink-soft)', marginBottom: 5 } }, label), input);
  const recvPhotoField = (label, files, setFiles) => /*#__PURE__*/React.createElement("div", null,
    /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: 'var(--ink-soft)', marginBottom: 5 } }, label),
    /*#__PURE__*/React.createElement("label", { className: "skl-btn skl-btn-ghost", style: { cursor: 'pointer' } },
      /*#__PURE__*/React.createElement(Camera, { size: 14 }),
      files.length ? ` ✓ выбрано: ${files.length}` : ' Выбрать / снять фото',
      /*#__PURE__*/React.createElement("input", {
        type: "file", accept: "image/*", capture: "environment", multiple: true, style: { display: 'none' },
        onChange: e => setFiles(Array.from(e.target.files || []))
      })));
  const receivingContent = /*#__PURE__*/React.createElement(React.Fragment, null,
    role === 'fulfillment' && /*#__PURE__*/React.createElement(Section, { title: "Новая приёмка машины", icon: /*#__PURE__*/React.createElement(Box, { size: 18 }), open: true, collapsible: false },
      /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 14 } },
        recvField('Дата', /*#__PURE__*/React.createElement("input", { type: "date", className: "skl-input", value: recvDate, onChange: e => setRecvDate(e.target.value) })),
        recvField('Номер машины *', /*#__PURE__*/React.createElement("input", { className: "skl-input", value: recvTruck, onChange: e => setRecvTruck(e.target.value), placeholder: "А123ВС 77" })),
        recvField('Перевозчик', /*#__PURE__*/React.createElement("input", { className: "skl-input", value: recvCarrier, onChange: e => setRecvCarrier(e.target.value), placeholder: "необязательно" })),
        recvField('Коробов / паллет', /*#__PURE__*/React.createElement("input", { className: "skl-input", value: recvBoxes, onChange: e => setRecvBoxes(e.target.value), placeholder: "напр. 20 паллет" }))),
      recvField('Комментарий', /*#__PURE__*/React.createElement("input", { className: "skl-input", value: recvNote, onChange: e => setRecvNote(e.target.value), placeholder: "состояние груза, замечания…" }), { marginBottom: 14 }),
      /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 } },
        recvPhotoField('Фото машины', recvTruckPhotos, setRecvTruckPhotos),
        recvPhotoField('Фото загрузки в фуре', recvCargoPhotos, setRecvCargoPhotos)),
      recvField('Товар, пришедший этой машиной — выбери артикулы и укажи короба (1 короб = 8 пар)',
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("datalist", { id: "recv-catalog-codes" },
            Object.keys(catalog).sort().map(code => /*#__PURE__*/React.createElement("option", { key: code, value: code },
              catalog[code].category ? `${catalog[code].category}` : ''))),
          recvItems.length === 0
            ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--ink-soft)', fontSize: 12.5, marginBottom: 10 } }, "Позиции не добавлены — необязательно, но так создаётся остаток на складе.")
            : /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 10 } },
                recvItems.map(it => {
                  const cat = it.article ? articleCategory(it.article) : '';
                  const hasGrid = it.article ? !!gridVector(it.article) : false;
                  const boxes = Number(it.boxes) || 0;
                  return /*#__PURE__*/React.createElement("div", { key: it.id, className: "skl-card", style: { padding: 12 } },
                    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' } },
                      /*#__PURE__*/React.createElement("div", { style: { flex: '1 1 200px', minWidth: 160 } },
                        /*#__PURE__*/React.createElement("input", { className: "skl-input", list: "recv-catalog-codes", value: it.article, placeholder: "Артикул (напр. 283-7)", onChange: e => updateRecvItem(it.id, 'article', e.target.value) }),
                        cat && /*#__PURE__*/React.createElement("div", { style: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 4 } }, cat)),
                      /*#__PURE__*/React.createElement("div", { style: { flex: '0 0 110px' } },
                        /*#__PURE__*/React.createElement("input", { className: "skl-input", type: "number", min: "0", value: it.boxes, placeholder: "Короба", onChange: e => updateRecvItem(it.id, 'boxes', e.target.value) }),
                        boxes > 0 && /*#__PURE__*/React.createElement("div", { style: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 4 } }, boxes * BOX_SIZE, " пар")),
                      /*#__PURE__*/React.createElement("button", { className: "skl-btn skl-btn-ghost", style: { color: 'var(--negative)', flex: 'none' }, onClick: () => removeRecvItem(it.id) },
                        /*#__PURE__*/React.createElement(Trash2, { size: 12 }))),
                    it.article && /*#__PURE__*/React.createElement("div", { style: { marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' } },
                      /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: hasGrid ? 'var(--ink-soft)' : 'var(--warn)', marginBottom: 8 } },
                        hasGrid ? "Размерная сетка короба (клик по размеру: нет / ×1 / ×2)" : "⚠ Задай размерную сетку короба: клик по размеру циклит нет / ×1 / ×2 (сумма = 8)"),
                      sizeGridEditor(it.article)));
                })),
          /*#__PURE__*/React.createElement("button", { className: "skl-btn skl-btn-ghost", onClick: addRecvItem },
            /*#__PURE__*/React.createElement(Plus, { size: 14 }), " Добавить артикул")),
        { marginBottom: 16 }),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } },
        /*#__PURE__*/React.createElement("button", { className: "skl-btn skl-btn-primary", disabled: recvSaving, onClick: submitReceiving }, recvSaving ? "Сохраняю…" : "Сохранить приёмку"),
        recvProgress && /*#__PURE__*/React.createElement("span", { style: { fontSize: 12, color: 'var(--ink-soft)' } }, recvProgress))),
    /*#__PURE__*/React.createElement(Section, { title: `Журнал приёмок (${receiving.length})`, icon: /*#__PURE__*/React.createElement(Clock, { size: 18 }), open: true, collapsible: false },
      receiving.length === 0
        ? /*#__PURE__*/React.createElement("div", { style: { color: 'var(--ink-soft)', fontSize: 13 } }, role === 'fulfillment' ? "Пока нет записей. Добавь первую приёмку выше." : "Пока нет записей о приёмке машин.")
        : /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
            receiving.map(rec => /*#__PURE__*/React.createElement("div", { key: rec.id, className: "skl-card" },
              /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' } },
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", { className: "skl-display", style: { fontSize: 16, fontWeight: 700 } }, "🚚 ", rec.truck),
                  /*#__PURE__*/React.createElement("div", { style: { fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 } },
                    fmtDate(rec.date), rec.carrier ? ` · ${rec.carrier}` : '', rec.boxes ? ` · ${rec.boxes}` : '',
                    rec.incomeQty ? /*#__PURE__*/React.createElement("span", { style: { color: 'var(--positive)' } }, ` · приход ${rec.incomeQty} шт.`) : '')),
                role === 'fulfillment' && /*#__PURE__*/React.createElement("button", { className: "skl-btn skl-btn-ghost", style: { color: 'var(--negative)' }, onClick: () => deleteReceiving(rec) },
                  /*#__PURE__*/React.createElement(Trash2, { size: 12 }), " Удалить")),
              rec.note && /*#__PURE__*/React.createElement("div", { style: { fontSize: 13, marginTop: 8, color: 'var(--ink)' } }, rec.note),
              receivingItems(rec).length > 0 && /*#__PURE__*/React.createElement("div", { style: { marginTop: 10 } },
                /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: 'var(--ink-soft)', marginBottom: 6 } }, `Приехало (${receivingItems(rec).length} арт.):`),
                /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
                  receivingItems(rec).map((it, i) => /*#__PURE__*/React.createElement("span", {
                    key: i,
                    style: { fontSize: 12.5, background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '4px 9px' }
                  }, /*#__PURE__*/React.createElement("span", { className: "skl-mono", style: { color: 'var(--accent)' } }, it.article),
                    ` · ${formatBoxes(it.boxes)} кор · ${it.qty} шт`)))),
              rec.photos && rec.photos.length > 0 && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 } },
                rec.photos.map((p, i) => /*#__PURE__*/React.createElement("img", {
                  key: i, src: p.url, alt: p.kind, title: p.kind === 'truck' ? 'Фото машины' : 'Фото загрузки',
                  onClick: () => window.open(p.url, '_blank'),
                  style: { width: 76, height: 76, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer' }
                }))))))));
  return /*#__PURE__*/React.createElement("div", {
    className: "skl-root",
    style: _objectSpread(_objectSpread({}, darkMode ? {
      // «Носим сутками» — тёмно-коричневый фон, оливка, золотой акцент
      '--paper': '#181510',
      '--card': '#221E17',
      '--card-2': '#2C271E',
      '--ink': '#EFE7D6',
      '--ink-soft': '#9B9078',
      '--line': '#393226',
      '--accent': '#D9A441',
      '--accent-soft': '#3A2E16',
      '--positive': '#8FB05A',
      '--positive-soft': '#242E16',
      '--negative': '#D06A4A',
      '--negative-soft': '#3A241B',
      '--warn': '#E0B24A',
      '--warn-soft': '#3A2E14',
      '--info': '#7FA39A',
      '--info-soft': '#1E2A27',
      '--row-hover': '#2A2519',
      '--input-bg': '#1E1A14'
    } : {
      // Светлая тема в той же тёплой гамме (кремовая + золото)
      '--paper': '#F5EFE1',
      '--card': '#FFFDF7',
      '--card-2': '#F0E9D8',
      '--ink': '#2C2519',
      '--ink-soft': '#8A8067',
      '--line': '#E3D9C2',
      '--accent': '#B8862B',
      '--accent-soft': '#F3E6C8',
      '--positive': '#5E7A2E',
      '--positive-soft': '#E8EFD6',
      '--negative': '#B24A2E',
      '--negative-soft': '#F6E1D6',
      '--warn': '#A9791A',
      '--warn-soft': '#F5E9C8',
      '--info': '#4A6E68',
      '--info-soft': '#E2ECEA',
      '--row-hover': '#FAF6EC',
      '--input-bg': '#FFFDF7'
    }), {}, {
      fontFamily: "'Inter', sans-serif",
      background: 'var(--paper)',
      color: 'var(--ink)',
      minHeight: '100%',
      boxSizing: 'border-box'
    })
  }, /*#__PURE__*/React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
        .skl-mono { font-family: 'JetBrains Mono', monospace; }
        .skl-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.01em; }
        .skl-stamp {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
          border-radius: 8px; font-family: 'Space Grotesk', sans-serif; font-size: 11px;
          font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--accent-soft); color: var(--accent);
        }
        .skl-row { transition: background .12s ease; }
        .skl-row:hover { background: var(--row-hover); }
        .skl-input {
          font-family: 'Inter', sans-serif; border: 1px solid var(--line); border-radius: 9px;
          padding: 9px 12px; font-size: 14px; background: var(--input-bg); color: var(--ink); width: 100%;
          box-sizing: border-box; transition: border-color .15s ease, box-shadow .15s ease;
        }
        .skl-input::placeholder { color: var(--ink-soft); }
        .skl-input:focus {
          outline: none; border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
        }
        .skl-btn {
          font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 13px;
          letter-spacing: 0.01em; border-radius: 9px; padding: 9px 15px; cursor: pointer;
          border: none; display: inline-flex; align-items: center; gap: 7px;
          transition: transform .08s ease, background .15s ease, border-color .15s ease, filter .15s ease;
        }
        .skl-btn:active { transform: scale(0.97); }
        .skl-btn-primary { background: var(--accent); color: #241D0E; box-shadow: 0 4px 14px -6px rgba(0,0,0,.5); }
        .skl-btn-primary:hover { filter: brightness(1.1); }
        .skl-btn-ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
        .skl-btn-ghost:hover { background: var(--card-2); border-color: var(--accent); }
        .skl-card {
          background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px;
          transition: border-color .15s ease, transform .15s ease;
        }
        .skl-iconchip {
          width: 34px; height: 34px; border-radius: 10px; display: inline-flex;
          align-items: center; justify-content: center; flex: none;
        }
        .skl-logo {
          width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center;
          justify-content: center; color: #fff; background: #8A8268;
          box-shadow: 0 6px 18px -6px rgba(0,0,0,.5);
        }
        .skl-divider { border: none; border-top: 1px solid var(--line); margin: 20px 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes skl-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .skl-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0; width: 210px; z-index: 50;
          background: var(--card); border-right: 1px solid var(--line);
          padding: 18px 14px; display: flex; flex-direction: column; box-sizing: border-box;
        }
        .skl-side-logo { display: flex; align-items: center; gap: 10px; padding: 4px 6px 16px; }
        .skl-nav {
          display: flex; align-items: center; gap: 13px; width: 100%; text-align: left;
          padding: 13px 14px; border-radius: 12px; border: none; background: transparent;
          color: var(--ink-soft); font-family: 'Inter', sans-serif; font-size: 14.5px; font-weight: 500;
          cursor: pointer; transition: background .15s, color .15s;
        }
        .skl-nav svg { width: 20px; height: 20px; }
        .skl-nav:hover { background: var(--row-hover); color: var(--ink); }
        .skl-nav.on { background: var(--accent-soft); color: var(--ink); }
        .skl-nav.on svg { color: var(--accent); }
        .skl-side-user {
          display: flex; align-items: center; gap: 9px; padding: 9px; border-radius: 11px;
          background: var(--card-2); border: 1px solid var(--line);
        }
        .skl-side-ava {
          width: 28px; height: 28px; border-radius: 8px; flex: none; background: var(--accent-soft);
          color: var(--accent); display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 12px; font-family: 'Space Grotesk', sans-serif;
        }
        .skl-side-logout {
          margin-left: auto; background: transparent; border: none; color: var(--ink-soft);
          cursor: pointer; padding: 5px; display: flex; border-radius: 7px; transition: .15s;
        }
        .skl-side-logout:hover { color: var(--negative); background: var(--negative-soft); }
        .skl-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .skl-iconbtn {
          width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center;
          justify-content: center; background: var(--card); border: 1px solid var(--line);
          color: var(--ink-soft); cursor: pointer; transition: .15s;
        }
        .skl-iconbtn:hover { color: var(--ink); border-color: var(--accent); }
        .skl-menu {
          position: absolute; right: 0; top: 42px; z-index: 60; min-width: 214px;
          background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 6px;
          box-shadow: 0 18px 44px -12px rgba(0,0,0,.5); animation: skl-fade .14s ease;
        }
        .skl-menu-item {
          display: flex; align-items: center; gap: 9px; width: 100%; text-align: left;
          padding: 9px 10px; border-radius: 8px; border: none; background: transparent;
          color: var(--ink); font-family: 'Inter', sans-serif; font-size: 13px; cursor: pointer;
        }
        .skl-menu-item:hover { background: var(--row-hover); }
        .skl-menu-item.danger { color: var(--negative); }
        .skl-menu-sep { height: 1px; background: var(--line); margin: 5px 4px; }
        .skl-metric { transition: transform .15s, border-color .15s; }
        .skl-metric:hover { transform: translateY(-2px); border-color: var(--accent); }
        .skl-root { padding: 24px 28px 28px 238px; min-height: 100vh; box-sizing: border-box; }
        @media (max-width: 760px) {
          .skl-root { padding: 14px; }
          .skl-sidebar { position: static; width: auto; flex-direction: row; flex-wrap: wrap; z-index: auto;
            border-right: none; border-bottom: 1px solid var(--line); margin-bottom: 14px; }
          .skl-side-logo { width: 100%; padding-bottom: 10px; }
          .skl-nav { width: auto; }
          .skl-side-user { display: none; }
        }

        .skl-label-sheet { display: none; }
        @media print {
          body * { visibility: hidden; }
          .skl-label-sheet, .skl-label-sheet * { visibility: visible; }
          .skl-label-sheet {
            display: grid !important; position: absolute; left: 0; top: 0; width: 100%;
            grid-template-columns: repeat(2, 1fr); gap: 2mm; padding: 4mm;
          }
          .skl-label {
            border: 1px dashed #999; border-radius: 2mm; padding: 2mm 3mm;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            text-align: center; break-inside: avoid; height: 28mm; box-sizing: border-box;
          }
          .skl-label svg { width: 100%; height: 14mm; }
          .skl-label .lbl-article { font-size: 12px; font-weight: 700; font-family: Arial, sans-serif; }
          .skl-label .lbl-meta { font-size: 10px; color: #333; font-family: Arial, sans-serif; }
        }
      `), !role ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 480
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Учёт остатков · Wildberries"), /*#__PURE__*/React.createElement("h1", {
    className: "skl-display",
    style: {
      fontSize: 28,
      margin: '0 0 4px'
    }
  }, "Склад клиента"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)',
      marginBottom: 28
    }
  }, "ИП Мукозобов Д.В."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--ink-soft)',
      marginBottom: 20
    }
  }, "Выберите, кто вы — это определяет набор инструментов на экране."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => chooseRole('client'),
    className: "skl-card",
    style: {
      flex: '1 1 180px',
      cursor: 'pointer',
      border: '1px solid var(--line)',
      textAlign: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 10,
      color: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement(ClipboardList, {
    size: 28
  })), /*#__PURE__*/React.createElement("div", {
    className: "skl-display",
    style: {
      fontWeight: 700,
      fontSize: 16,
      marginBottom: 4
    }
  }, "Клиент"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)'
    }
  }, "Смотреть остатки и собирать ТЗ на отгрузку")), /*#__PURE__*/React.createElement("button", {
    onClick: () => chooseRole('fulfillment'),
    className: "skl-card",
    style: {
      flex: '1 1 180px',
      cursor: 'pointer',
      border: '1px solid var(--line)',
      textAlign: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 10,
      color: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement(Box, {
    size: 28
  })), /*#__PURE__*/React.createElement("div", {
    className: "skl-display",
    style: {
      fontWeight: 700,
      fontSize: 16,
      marginBottom: 4
    }
  }, "Фулфилмент"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)'
    }
  }, "Вести учёт, загружать акты, обрабатывать ТЗ"))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("aside", {
    className: "skl-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "skl-side-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "skl-logo",
    style: { width: 36, height: 36, borderRadius: 10 }
  }, /*#__PURE__*/React.createElement("svg", { viewBox: DUCK_VB, width: 28, height: 26, xmlns: "http://www.w3.org/2000/svg" },
    /*#__PURE__*/React.createElement("path", { d: DUCK_PATH, fill: "#F3F0DA", fillRule: "evenodd" }))), /*#__PURE__*/React.createElement("div", {
    className: "skl-display",
    style: { fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }
  }, "Носим сутками")), /*#__PURE__*/React.createElement("nav", {
    style: { display: 'flex', flexDirection: 'column', gap: 7 }
  }, navItems.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.key,
    onClick: () => { setActiveTab(n.key); setMenuOpen(false); },
    className: "skl-nav" + (activeTab === n.key ? " on" : "")
  }, n.icon, /*#__PURE__*/React.createElement("span", null, n.label)))), /*#__PURE__*/React.createElement("div", {
    style: { flex: 1 }
  }), /*#__PURE__*/React.createElement("div", {
    className: "skl-side-user"
  }, /*#__PURE__*/React.createElement("div", {
    className: "skl-side-ava"
  }, role === 'client' ? 'К' : 'Ф'), /*#__PURE__*/React.createElement("div", {
    style: { lineHeight: 1.25, minWidth: 0, flex: 1 }
  }, /*#__PURE__*/React.createElement("div", {
    style: { fontSize: 12, fontWeight: 600 }
  }, role === 'client' ? 'Клиент' : 'Фулфилмент'), /*#__PURE__*/React.createElement("div", {
    style: { fontSize: 10.5, color: 'var(--ink-soft)' }
  }, "вход выполнен")), /*#__PURE__*/React.createElement("button", {
    className: "skl-side-logout",
    title: "Выйти",
    onClick: () => window.supabase.auth.signOut()
  }, svgIcon([
    /*#__PURE__*/React.createElement("path", { key: 1, d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
    /*#__PURE__*/React.createElement("polyline", { key: 2, points: "16 17 21 12 16 7" }),
    /*#__PURE__*/React.createElement("line", { key: 3, x1: 21, y1: 12, x2: 9, y2: 12 })
  ])))), printMode && /*#__PURE__*/React.createElement(LabelPrintView, {
    items: labelItems()
  }), /*#__PURE__*/React.createElement("div", {
    className: "skl-topbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      marginBottom: 3
    }
  }, "Учёт остатков · Wildberries"), /*#__PURE__*/React.createElement("h1", {
    className: "skl-display",
    style: { fontSize: 24, margin: 0 }
  }, pageTitle)), /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', gap: 8, alignItems: 'center' }
  }, saving && /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 12, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6 }
  }, /*#__PURE__*/React.createElement(Loader2, {
    size: 14,
    style: { animation: 'spin 1s linear infinite' }
  }), " сохранение…"), /*#__PURE__*/React.createElement("span", {
    className: "skl-stamp"
  }, role === 'client' ? 'Клиент' : 'Фулфилмент'), /*#__PURE__*/React.createElement("button", {
    className: "skl-iconbtn",
    onClick: () => setDarkMode(d => !d),
    title: darkMode ? 'Светлая тема' : 'Тёмная тема'
  }, darkMode ? /*#__PURE__*/React.createElement(Sun, { size: 15 }) : /*#__PURE__*/React.createElement(Moon, { size: 15 })), /*#__PURE__*/React.createElement("button", {
    className: "skl-iconbtn",
    onClick: loadAll,
    title: "Обновить"
  }, /*#__PURE__*/React.createElement(RefreshCcw, { size: 15 })), /*#__PURE__*/React.createElement("div", {
    style: { position: 'relative' }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-iconbtn",
    onClick: () => setMenuOpen(o => !o),
    title: "Ещё"
  }, /*#__PURE__*/React.createElement("svg", {
    width: 17, height: 17, viewBox: "0 0 24 24", fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", { cx: 12, cy: 5, r: 1.6 }),
    /*#__PURE__*/React.createElement("circle", { cx: 12, cy: 12, r: 1.6 }),
    /*#__PURE__*/React.createElement("circle", { cx: 12, cy: 19, r: 1.6 }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "skl-menu"
  }, /*#__PURE__*/React.createElement("label", {
    className: "skl-menu-item",
    style: { cursor: 'pointer' }
  }, /*#__PURE__*/React.createElement(FolderOpen, { size: 15 }), " Загрузить копию данных", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: e => { importBackup(e); setMenuOpen(false); },
    style: { display: 'none' }
  })), /*#__PURE__*/React.createElement("button", {
    className: "skl-menu-item",
    onClick: () => { exportBackup(); setMenuOpen(false); }
  }, /*#__PURE__*/React.createElement(Save, { size: 15 }), " Скачать копию данных"), /*#__PURE__*/React.createElement("div", {
    className: "skl-menu-sep"
  }), /*#__PURE__*/React.createElement("button", {
    className: "skl-menu-item danger",
    onClick: () => { resetAllData(); setMenuOpen(false); }
  }, /*#__PURE__*/React.createElement(Trash2, { size: 15 }), " Сбросить всё (тест)"))), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    onClick: exportExcel
  }, /*#__PURE__*/React.createElement(Download, { size: 14 }), " Экспорт"))), activeTab === 'dashboard' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 11,
      marginBottom: 13
    }
  }, [{
    label: 'Артикулов',
    value: totals.sku,
    exportKind: 'sku',
    tone: 'accent',
    icon: /*#__PURE__*/React.createElement(Search, {
      size: 17
    })
  }, {
    label: 'Приход всего',
    value: totals.income,
    exportKind: 'income',
    tone: 'positive',
    icon: /*#__PURE__*/React.createElement(Box, {
      size: 17
    })
  }, {
    label: 'Брак всего',
    value: totals.defect,
    exportKind: 'defect',
    tone: 'negative',
    icon: /*#__PURE__*/React.createElement(AlertTriangle, {
      size: 17
    })
  }, {
    label: 'Фотостудия',
    value: totals.photo,
    exportKind: 'photo',
    tone: 'info',
    icon: /*#__PURE__*/React.createElement(Camera, {
      size: 17
    })
  }, {
    label: 'Обезличка',
    value: totals.unidentified,
    exportKind: 'unidentified',
    tone: 'warn',
    icon: /*#__PURE__*/React.createElement(AlertTriangle, {
      size: 17
    })
  }, {
    label: 'Отгружено всего',
    value: totals.shipped,
    exportKind: 'shipped',
    tone: 'positive',
    icon: /*#__PURE__*/React.createElement(Upload, {
      size: 17
    })
  }, {
    label: 'Остаток на складе',
    value: totals.balance,
    exportKind: 'balance',
    tone: 'accent',
    highlight: true,
    icon: /*#__PURE__*/React.createElement(Download, {
      size: 17
    })
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "skl-card skl-metric",
    style: {
      padding: '15px 16px',
      borderColor: s.highlight ? 'var(--accent)' : 'var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  }, /*#__PURE__*/React.createElement("div", {
    className: "skl-iconchip",
    style: {
      background: `var(--${s.tone}-soft)`,
      color: `var(--${s.tone})`
    }
  }, s.icon), /*#__PURE__*/React.createElement("button", {
    title: `Скачать «${s.label}» в Excel`,
    onClick: () => exportMetric(s.exportKind),
    className: "skl-btn skl-btn-ghost",
    style: { padding: '4px 7px', minHeight: 0, lineHeight: 1, color: 'var(--ink-soft)' }
  }, /*#__PURE__*/React.createElement(Download, { size: 14 }))), /*#__PURE__*/React.createElement("div", {
    className: "skl-display",
    style: {
      fontSize: 27,
      fontWeight: 700,
      marginTop: 11,
      color: s.highlight ? 'var(--accent)' : 'var(--ink)'
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--ink-soft)',
      marginTop: 3
    }
  }, s.label)))), dashboardCharts), false && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, [{
    key: 'main',
    label: 'Остатки',
    icon: /*#__PURE__*/React.createElement(Box, {
      size: 16
    })
  }, {
    key: 'receiving',
    label: 'Приёмка машин',
    icon: /*#__PURE__*/React.createElement(Clock, {
      size: 16
    })
  }, {
    key: 'tz',
    label: 'ТЗ на отгрузку',
    icon: /*#__PURE__*/React.createElement(ClipboardList, {
      size: 16
    })
  }, ...(role === 'fulfillment' ? [{
    key: 'labels',
    label: 'Этикетки',
    icon: /*#__PURE__*/React.createElement(Tag, {
      size: 16
    })
  }] : []), {
    key: 'reports',
    label: 'Отчёты',
    icon: /*#__PURE__*/React.createElement(Calendar, {
      size: 16
    })
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    onClick: () => setActiveTab(t.key),
    className: activeTab === t.key ? 'skl-btn skl-btn-primary' : 'skl-btn skl-btn-ghost',
    style: {
      position: 'relative'
    }
  }, t.icon, " ", t.label, t.key === 'tz' && role === 'fulfillment' && tzRequests.some(r => r.status === 'new') && /*#__PURE__*/React.createElement("span", {
    className: "skl-mono",
    style: {
      position: 'absolute',
      top: -6,
      right: -6,
      background: 'var(--negative)',
      color: '#fff',
      borderRadius: '999px',
      fontSize: 11,
      fontWeight: 700,
      minWidth: 18,
      height: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px'
    }
  }, tzRequests.filter(r => r.status === 'new').length)))), (activeTab === 'main' || aktPreview) && /*#__PURE__*/React.createElement(React.Fragment, null, activeTab === 'main' && /*#__PURE__*/React.createElement(Section, {
    title: "Списать для фотостудии",
    icon: /*#__PURE__*/React.createElement(Camera, {
      size: 18
    }),
    open: openSections.photo,
    onToggle: () => toggleSection('photo')
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)',
      marginTop: 0,
      marginBottom: 12
    }
  }, "Добавь все пары, которые увезли на съёмку — спишутся одним списанием."), photoItems.map((it, idx) => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 110px 90px 32px',
      gap: 8,
      alignItems: 'end',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, idx === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Артикул"), /*#__PURE__*/React.createElement(ArticleCombobox, {
    value: it.article,
    onChange: v => updatePhotoRow(it.id, 'article', v),
    options: photoArticleOptions,
    names: names
  })), /*#__PURE__*/React.createElement("div", null, idx === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Размер"), sizesForArticle(it.article).length ? /*#__PURE__*/React.createElement("select", {
    className: "skl-input",
    value: it.size,
    onChange: e => updatePhotoRow(it.id, 'size', e.target.value)
  }, sizesForArticle(it.article).map(sz => /*#__PURE__*/React.createElement("option", {
    key: sz,
    value: sz
  }, sz))) : /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    placeholder: "Размер",
    value: it.size,
    onChange: e => updatePhotoRow(it.id, 'size', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, idx === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Кол-во"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    placeholder: "Кол-во",
    type: "number",
    value: it.qty,
    onChange: e => updatePhotoRow(it.id, 'qty', e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    style: {
      padding: '8px'
    },
    disabled: photoItems.length === 1,
    onClick: () => removePhotoRow(it.id),
    title: "Убрать строку"
  }, /*#__PURE__*/React.createElement(Trash2, {
    size: 14
  })))), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    style: {
      marginBottom: 14
    },
    onClick: addPhotoRow
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 14
  }), " Добавить артикул"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '140px 1fr auto',
      gap: 8,
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Дата"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    type: "date",
    value: photoDate,
    onChange: e => setPhotoDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Комментарий"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    placeholder: "Комментарий",
    value: photoNote,
    onChange: e => setPhotoNote(e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    onClick: confirmPhotoBatch
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 14
  }), " Списать"))), aktPreview && /*#__PURE__*/React.createElement("div", {
    className: "skl-card",
    style: {
      marginBottom: 24,
      borderColor: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "skl-display",
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "Акт приёмки — ", aktPreview.fileName), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '200px 160px 1fr',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Номер поставки"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    value: aktPreview.shipmentNumber,
    onChange: e => setAktPreview(_objectSpread(_objectSpread({}, aktPreview), {}, {
      shipmentNumber: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Дата приёмки"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    type: "date",
    value: aktPreview.date,
    onChange: e => setAktPreview(_objectSpread(_objectSpread({}, aktPreview), {}, {
      date: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)'
    }
  }, "Коробов: ", /*#__PURE__*/React.createElement("strong", {
    className: "skl-mono"
  }, aktPreview.boxCount), " · Позиций: ", /*#__PURE__*/React.createElement("strong", {
    className: "skl-mono"
  }, aktPreview.totals.length), " · Всего шт.: ", /*#__PURE__*/React.createElement("strong", {
    className: "skl-mono"
  }, aktPreview.totals.reduce((s, t) => s + t.qty, 0))))), aktPreview.totals.length === 0 && aktPreview.unidentified > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: 12,
      borderRadius: 8,
      background: 'var(--negative-soft)',
      border: '1.5px solid var(--negative)',
      fontSize: 13,
      color: 'var(--negative)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 16
  }), " Похоже на ошибку разбора файла"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 400
    }
  }, "Ни одна строка не распозналась как обычная позиция — весь объём (", aktPreview.unidentified, " шт.) попал в «неопознанный товар». Скорее всего, в этом файле колонка «Артикул продавца» называется или расположена иначе, чем в предыдущем акте. Нажми «Отмена» и пришли этот файл — проверю структуру и поправлю разбор.")), aktPreview.unidentified > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: 10,
      borderRadius: 8,
      background: 'var(--warn-soft)',
      border: '1px dashed var(--warn)',
      fontSize: 13,
      color: 'var(--warn)',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 16
  }), " Обезличка: ", aktPreview.unidentified, " шт. — учтётся как ОТГРУЗКА артикула короба (товар ушёл на WB, остаток уменьшится).", aktPreview.unidentifiedNoArticle > 0 ? ` Из них ${aktPreview.unidentifiedNoArticle} шт. без короба/артикула — отдельно.` : ''), aktPreview.defects.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: 12,
      borderRadius: 8,
      background: 'var(--negative-soft)',
      border: '1px dashed var(--negative)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontWeight: 700,
      color: 'var(--negative)',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 16
  }), " Найдены неполные коробы"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      textAlign: 'left',
      color: 'var(--ink-soft)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Артикул"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Размер"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Не хватает"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Уже на фотостудии"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Записать как брак"))), /*#__PURE__*/React.createElement("tbody", null, aktPreview.defects.map((d, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px',
      fontWeight: 600
    }
  }, d.article), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px'
    }
  }, d.size), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '4px 8px'
    }
  }, d.qty), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '4px 8px',
      color: d.matchedQty > 0 ? 'var(--positive)' : 'var(--ink-soft)'
    }
  }, d.matchedQty > 0 ? `−${d.matchedQty}` : '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    type: "number",
    min: "0",
    style: {
      width: 70
    },
    value: d.recordQty,
    onChange: e => updateAktDefectQty(i, Number(e.target.value))
  })))))), aktPreview.defects.some(d => d.matchedQty > 0) && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginTop: 8,
      marginBottom: 0
    }
  }, "«Уже на фотостудии» — часть недостачи объясняется ранее списанными для съёмки парами, она не пойдёт в брак повторно. Можно изменить «Записать как брак» вручную.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: 10,
      borderRadius: 8,
      background: 'var(--positive-soft)',
      color: 'var(--positive)',
      fontSize: 13,
      fontWeight: 600
    }
  }, "Все коробы полные (", BOX_SIZE, " пар) — брак не найден."), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      marginBottom: 14,
      border: '1px solid var(--line)',
      borderRadius: 8,
      maxHeight: 260,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--paper)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '6px 10px',
      fontWeight: 600
    }
  }, "Артикул"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '6px 10px',
      fontWeight: 600
    }
  }, "Размер"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '6px 10px',
      fontWeight: 600
    },
    className: "skl-mono"
  }, "Кол-во"))), /*#__PURE__*/React.createElement("tbody", null, aktPreview.totals.map((t, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 10px',
      fontWeight: 600
    }
  }, t.article), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 10px'
    }
  }, t.size), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '6px 10px'
    }
  }, t.qty)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    onClick: confirmAkt
  }, "Записать отгрузку и брак"), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    onClick: () => { setAktPreview(null); setAktTzId(null); }
  }, "Отмена"))), uploadPreview && /*#__PURE__*/React.createElement("div", {
    className: "skl-card",
    style: {
      marginBottom: 24,
      borderColor: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "skl-display",
    style: {
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Сопоставь колонки — ", uploadPreview.fileName, /*#__PURE__*/React.createElement("span", {
    className: "skl-stamp",
    style: {
      marginLeft: 10,
      color: uploadPreview.kind === 'income' ? 'var(--positive)' : 'var(--negative)'
    }
  }, uploadPreview.kind === 'income' ? 'приход' : 'отгрузка')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 10,
      marginBottom: 12
    }
  }, FIELD_DEFS[uploadPreview.kind].map(f => /*#__PURE__*/React.createElement("div", {
    key: f.key
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, f.label), /*#__PURE__*/React.createElement("select", {
    className: "skl-input",
    value: uploadPreview.mapping[f.key],
    onChange: e => setUploadPreview(_objectSpread(_objectSpread({}, uploadPreview), {}, {
      mapping: _objectSpread(_objectSpread({}, uploadPreview.mapping), {}, {
        [f.key]: e.target.value
      })
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— не выбрано —"), uploadPreview.headers.map((h, i) => /*#__PURE__*/React.createElement("option", {
    key: i,
    value: h
  }, h))))), uploadPreview.kind === 'income' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Дата прихода (для всей партии)"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    type: "date",
    value: uploadPreview.batchDate,
    onChange: e => setUploadPreview(_objectSpread(_objectSpread({}, uploadPreview), {}, {
      batchDate: e.target.value
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      marginBottom: 12,
      border: '1px solid var(--line)',
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--paper)'
    }
  }, uploadPreview.headers.map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      padding: '6px 10px',
      textAlign: 'left',
      fontWeight: 600
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, uploadPreview.rows.slice(0, 4).map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri
  }, r.map((c, ci) => /*#__PURE__*/React.createElement("td", {
    key: ci,
    className: "skl-mono",
    style: {
      padding: '6px 10px',
      borderTop: '1px solid var(--line)'
    }
  }, String(c)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 12
    }
  }, "Найдено строк: ", uploadPreview.rows.length), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    onClick: confirmUpload
  }, "Записать как ", uploadPreview.kind === 'income' ? 'приход' : 'отгрузку'), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    onClick: () => setUploadPreview(null)
  }, "Отмена")))), activeTab === 'tz' && /*#__PURE__*/React.createElement(React.Fragment, null, role === 'client' && /*#__PURE__*/React.createElement(Section, {
    title: "ТЗ на отгрузку",
    icon: /*#__PURE__*/React.createElement(ClipboardList, {
      size: 18
    }),
    open: true,
    collapsible: false
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)',
      marginTop: 0,
      marginBottom: 12
    }
  }, "Выбери артикулы и укажи, сколько коробов отгрузить. Рядом видно текущий остаток — можно сверяться при составлении задания. «Под остаток» подставит точное количество (в штуках), даже если оно не кратно ", BOX_SIZE, "."), tzItems.map((it, idx) => {
    const balance = balanceForArticle(it.article);
    const boxesFull = Math.trunc(balance / BOX_SIZE);
    const rem = balance - boxesFull * BOX_SIZE;
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      style: {
        display: 'grid',
        gridTemplateColumns: '1.4fr 1.6fr 110px 130px 32px',
        gap: 8,
        alignItems: 'end',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", null, idx === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-soft)',
        marginBottom: 4
      }
    }, "Артикул"), /*#__PURE__*/React.createElement(ArticleCombobox, {
      value: it.article,
      onChange: v => updateTzRow(it.id, 'article', v),
      options: photoArticleOptions,
      names: names
    })), /*#__PURE__*/React.createElement("div", null, idx === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-soft)',
        marginBottom: 4
      }
    }, "Остаток сейчас"), /*#__PURE__*/React.createElement("div", {
      className: "skl-mono",
      style: {
        padding: '8px 10px',
        border: '1px solid var(--line)',
        borderRadius: 6,
        background: 'var(--paper)',
        fontSize: 13
      }
    }, balance, " шт. (", boxesFull, " кор.", rem > 0 ? ` + ${rem}` : '', ")")), /*#__PURE__*/React.createElement("div", null, idx === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-soft)',
        marginBottom: 4
      }
    }, "Короба"), it.mode === 'all' ? /*#__PURE__*/React.createElement("div", {
      className: "skl-mono",
      style: {
        padding: '8px 10px',
        border: '1px solid var(--accent)',
        borderRadius: 6,
        color: 'var(--accent)',
        fontWeight: 700,
        fontSize: 13
      }
    }, formatBoxes(balance / BOX_SIZE), " кор.") : /*#__PURE__*/React.createElement("input", {
      className: "skl-input",
      type: "number",
      min: "0",
      value: it.boxes,
      onChange: e => updateTzRow(it.id, 'boxes', e.target.value)
    })), /*#__PURE__*/React.createElement("div", null, idx === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-soft)',
        marginBottom: 4
      }
    }, "\xA0"), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      style: it.mode === 'all' ? {
        borderColor: 'var(--accent)',
        color: 'var(--accent)'
      } : {},
      onClick: () => updateTzRow(it.id, 'mode', it.mode === 'all' ? 'boxes' : 'all')
    }, "Под остаток")), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      style: {
        padding: '8px'
      },
      disabled: tzItems.length === 1,
      onClick: () => removeTzRow(it.id),
      title: "Убрать строку"
    }, /*#__PURE__*/React.createElement(Trash2, {
      size: 14
    })));
  }), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    style: {
      marginBottom: 16
    },
    onClick: addTzRow
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 14
  }), " Добавить артикул"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '140px 1fr 1fr',
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Дата"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    type: "date",
    value: tzDate,
    onChange: e => setTzDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Склад WB"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    list: "tz-warehouse-options",
    placeholder: "Например: Коледино",
    value: tzWarehouse,
    onChange: e => setTzWarehouse(e.target.value)
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "tz-warehouse-options"
  }, tzWarehouses.map(w => /*#__PURE__*/React.createElement("option", {
    key: w,
    value: w
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "Комментарий (необязательно)"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    placeholder: "Например: срочно к пятнице",
    value: tzNote,
    onChange: e => setTzNote(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    onClick: submitTzRequest
  }, /*#__PURE__*/React.createElement(Upload, {
    size: 14
  }), " Отправить складу"))), /*#__PURE__*/React.createElement(Section, {
    title: "Заявки на отгрузку",
    icon: /*#__PURE__*/React.createElement(ClipboardList, {
      size: 18
    }),
    open: true,
    collapsible: false
  }, tzRequests.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)'
    }
  }, "Пока нет сформированных заявок.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--ink-soft)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Дата"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Заявка"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Статус"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, tzRequests.map(r => {
    const statusInfo = {
      new: {
        label: 'Новое',
        color: 'var(--warn)'
      },
      in_progress: {
        label: 'В работе',
        color: 'var(--accent)'
      },
      shipping: {
        label: 'Принимается складом WB',
        color: 'var(--accent)'
      },
      done: {
        label: 'Отгружено',
        color: 'var(--positive)'
      }
    }[r.status] || {
      label: r.status,
      color: 'var(--ink-soft)'
    };
    const isOpen = expandedTz === r.id;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: r.id
    }, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderTop: '1px solid var(--line)',
        cursor: 'pointer'
      },
      className: "skl-row",
      onClick: () => setExpandedTz(isOpen ? null : r.id)
    }, /*#__PURE__*/React.createElement("td", {
      className: "skl-mono",
      style: {
        padding: '6px 8px',
        whiteSpace: 'nowrap'
      }
    }, fmtDate(r.date)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px'
      }
    }, r.rows.length, " артикулов, ", r.totalBoxes, " коробов", r.warehouse ? ` · склад: ${r.warehouse}` : '', r.note ? ` · ${r.note}` : ''), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "skl-stamp",
      style: {
        color: statusInfo.color
      }
    }, statusInfo.label)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px',
        textAlign: 'right'
      }
    }, isOpen ? /*#__PURE__*/React.createElement(ChevronDown, {
      size: 14
    }) : /*#__PURE__*/React.createElement(ChevronRight, {
      size: 14
    }))), isOpen && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "4",
      style: {
        padding: '0 8px 12px',
        background: 'var(--paper)'
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        fontSize: 12,
        borderCollapse: 'collapse',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        color: 'var(--ink-soft)',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '4px 8px',
        fontWeight: 500
      }
    }, "Артикул"), /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '4px 8px',
        fontWeight: 500
      },
      className: "skl-mono"
    }, "Короба"))), /*#__PURE__*/React.createElement("tbody", null, r.rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
      key: i,
      style: {
        borderTop: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '4px 8px'
      }
    }, row.article, row.name ? ` — ${row.name}` : ''), /*#__PURE__*/React.createElement("td", {
      className: "skl-mono",
      style: {
        padding: '4px 8px'
      }
    }, row.boxesLabel))))), role === 'fulfillment' ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-primary",
      disabled: bundlingTz === r.id,
      onClick: () => downloadTzBundle(r)
    }, /*#__PURE__*/React.createElement(Download, {
      size: 12
    }), bundlingTz === r.id ? " Собираю архив…" : " Скачать для работы"), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      disabled: wbBusy === r.id,
      onClick: () => { setWbNumber('WB_'); setWbPromptFor(f => f === r.id ? null : r.id); }
    }, /*#__PURE__*/React.createElement(Box, {
      size: 12
    }), wbBusy === r.id ? " Генерирую…" : " Поставка WB"), wbPromptFor === r.id && /*#__PURE__*/React.createElement("div", {
      style: { flexBasis: '100%', display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }
    }, /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 13, color: 'var(--ink-soft)' }
    }, "Первый ШК короба WB:"), /*#__PURE__*/React.createElement("input", {
      className: "skl-input",
      autoFocus: true,
      value: wbNumber,
      onChange: e => setWbNumber(e.target.value),
      onKeyDown: e => { if (e.key === 'Enter') downloadWbSupply(r, wbNumber); },
      placeholder: "WB_1611640048",
      style: { maxWidth: 220 }
    }), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-primary",
      disabled: wbBusy === r.id,
      onClick: () => downloadWbSupply(r, wbNumber)
    }, wbBusy === r.id ? "Генерирую…" : "Сгенерировать"), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      onClick: () => setWbPromptFor(null)
    }, "Отмена")), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      onClick: () => downloadTzWord(r.rows, r.date, r.note, r.warehouse)
    }, /*#__PURE__*/React.createElement(Download, {
      size: 12
    }), " Word"), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      onClick: () => downloadTzExcel(r.rows, r.date)
    }, /*#__PURE__*/React.createElement(FileSpreadsheet, {
      size: 12
    }), " Excel"), r.status === 'new' && /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-primary",
      onClick: () => updateTzStatus(r.id, 'in_progress')
    }, "Принять в работу"), r.status === 'in_progress' && /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-primary",
      onClick: () => updateTzStatus(r.id, 'shipping')
    }, "Отгружено (принимается WB)"), r.status === 'in_progress' && /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      onClick: () => updateTzStatus(r.id, 'new')
    }, "Вернуть"), r.status === 'shipping' && /*#__PURE__*/React.createElement("label", {
      className: "skl-btn skl-btn-primary",
      style: { cursor: 'pointer' }
    }, /*#__PURE__*/React.createElement(Upload, {
      size: 12
    }), " Загрузить акт WB (отгрузить)", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: ".xlsx,.xls,.csv",
      style: { display: 'none' },
      onChange: e => { setAktTzId(r.id); handleFile(e, 'shipment'); }
    })), r.status === 'shipping' && /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      onClick: () => updateTzStatus(r.id, 'in_progress')
    }, "Вернуть в работу"), r.status === 'done' && /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      onClick: () => updateTzStatus(r.id, 'shipping')
    }, "Вернуть в «принимается WB»"), /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      style: {
        color: 'var(--negative)'
      },
      onClick: () => deleteTzRequest(r.id)
    }, /*#__PURE__*/React.createElement(Trash2, {
      size: 12
    }), " Удалить")) : r.status === 'new' && /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      style: {
        color: 'var(--negative)'
      },
      onClick: () => deleteTzRequest(r.id)
    }, /*#__PURE__*/React.createElement(Trash2, {
      size: 12
    }), " Отменить заявку"))));
  }))))), activeTab === 'labels' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, {
    title: "Печать этикеток",
    icon: /*#__PURE__*/React.createElement(Tag, {
      size: 18
    }),
    open: true,
    collapsible: false
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)',
      marginTop: 0,
      marginBottom: 16
    }
  }, "Синхронизируй каталог напрямую с Wildberries (кнопка ниже) — названия, штрихкоды и размеры подтянутся автоматически. Или загрузи файл каталога вручную. Каталог сохраняется в базе."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "skl-btn skl-btn-ghost",
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(FileSpreadsheet, {
    size: 14
  }), labelFile ? `✓ ${labelFile.name}` : Object.keys(catalog).length ? `✓ Каталог загружен (${Object.keys(catalog).length} арт.) — обновить` : 'Загрузить каталог товаров', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".xlsx,.xls",
    style: {
      display: 'none'
    },
    onChange: e => {
      handleLabelFile(e.target.files[0]);
      setLabelSelected([]);
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: { marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    disabled: syncingBarcodes,
    onClick: () => syncBarcodes()
  }, /*#__PURE__*/React.createElement(RefreshCcw, { size: 14 }), syncingBarcodes ? " Синхронизирую…" : " Синхронизировать с WB"), barcodesSyncedAt && /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 12, color: 'var(--ink-soft)' }
  }, "обновлено с WB: ", fmtDate(String(barcodesSyncedAt).slice(0, 10))), /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 12, color: 'var(--ink-soft)' }
  }, "· авто каждый день в 9:00 МСК"), syncError && /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 12, color: 'var(--negative)' }
  }, syncError)), labelError && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: 10,
      borderRadius: 8,
      background: 'var(--negative-soft)',
      border: '1px dashed var(--negative)',
      fontSize: 13,
      color: 'var(--negative)'
    }
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 14,
    style: {
      verticalAlign: 'middle',
      marginRight: 6
    }
  }), labelError), Object.keys(labelArticles).length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 6
    }
  }, "Выбери артикул из списка:"), /*#__PURE__*/React.createElement(ArticleCombobox, {
    value: "",
    onChange: artStr => {
      if (!artStr) return;
      if (!labelSelected.find(s => s.artStr === artStr)) {
        setLabelSelected(prev => [...prev, {
          artStr,
          boxes: 1
        }]);
      }
    },
    options: Object.keys(labelArticles).filter(a => !labelSelected.find(s => s.artStr === a)),
    names: Object.fromEntries(Object.entries(labelArticles).map(([k, v]) => [k, v.name])),
    placeholder: "Начни вводить артикул или название…"
  })), labelSelected.length > 0 && /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--ink-soft)',
      textAlign: 'left',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '6px 8px',
      fontWeight: 500
    }
  }, "Артикул"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '6px 8px',
      fontWeight: 500
    }
  }, "Название"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '6px 8px',
      fontWeight: 500
    }
  }, "Сетка (1 короб)"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '6px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Коробов"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, labelSelected.map(({
    artStr,
    boxes
  }) => {
    const data = labelArticles[artStr];
    if (!data) return null;
    const totalQty = data.sizes.reduce((s, x) => s + x.qty, 0);
    const refBoxes = totalQty / 8;
    const sortedSizes = [...data.sizes].sort((a, b) => a.size - b.size);
    const grid = refBoxes > 0
      ? sortedSizes.map(s => `${s.size}×${Math.round(s.qty / refBoxes)}`).join(', ')
      : sortedSizes.map(s => s.size).join(', ') + ' — нет остатка';
    return /*#__PURE__*/React.createElement("tr", {
      key: artStr,
      style: {
        borderTop: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px',
        fontWeight: 600
      }
    }, data.code), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px',
        color: 'var(--ink-soft)'
      }
    }, data.name), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px',
        fontSize: 12
      },
      className: "skl-mono"
    }, grid), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      className: "skl-input",
      type: "number",
      min: "1",
      style: {
        width: 65
      },
      value: boxes,
      onChange: e => setLabelSelected(prev => prev.map(s => s.artStr === artStr ? _objectSpread(_objectSpread({}, s), {}, {
        boxes: Math.max(1, Number(e.target.value) || 1)
      }) : s))
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "skl-btn skl-btn-ghost",
      style: {
        padding: '4px 8px'
      },
      onClick: () => setLabelSelected(prev => prev.filter(s => s.artStr !== artStr))
    }, /*#__PURE__*/React.createElement(Trash2, {
      size: 12
    }))));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    disabled: labelSelected.length === 0 || generatingLabels,
    onClick: () => generateLabelPDFs(labelSelected)
  }, generatingLabels ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Loader2, {
    size: 14,
    style: {
      animation: 'spin 1s linear infinite'
    }
  }), " Генерирую…") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Download, {
    size: 14
  }), " Скачать PDF (", labelSelected.length, " арт.)")), generatingLabels && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)'
    }
  }, labelProgress), labelProgress && !generatingLabels && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--positive)'
    }
  }, labelProgress))))), activeTab === 'reports' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, {
    title: "Брак по артикулам и размерам",
    icon: /*#__PURE__*/React.createElement(AlertTriangle, {
      size: 18,
      color: "var(--negative)"
    }),
    open: openSections.defectStats,
    onToggle: () => toggleSection('defectStats')
  }, defectStats.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)'
    }
  }, "Брака пока не было.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--ink-soft)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Артикул"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Размер"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Кол-во, шт."), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Случаев"))), /*#__PURE__*/React.createElement("tbody", null, defectStats.map((d, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      fontWeight: 600
    }
  }, d.article), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, d.size), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '6px 8px',
      color: 'var(--negative)',
      fontWeight: 700
    }
  }, d.qty), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '6px 8px',
      color: 'var(--ink-soft)'
    }
  }, d.count))), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderTop: '2px solid var(--line)',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, "Итого"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '6px 8px',
      color: 'var(--negative)'
    }
  }, defectStats.reduce((s, d) => s + d.qty, 0)), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '6px 8px',
      color: 'var(--ink-soft)'
    }
  }, defectStats.reduce((s, d) => s + d.count, 0)))))), /*#__PURE__*/React.createElement(Section, {
    title: "Статистика за период",
    icon: /*#__PURE__*/React.createElement(Calendar, {
      size: 18
    }),
    open: openSections.period,
    onToggle: () => toggleSection('period')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "С"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    type: "date",
    value: statsFrom,
    onChange: e => setStatsFrom(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-soft)',
      marginBottom: 4
    }
  }, "По"), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    type: "date",
    value: statsTo,
    onChange: e => setStatsTo(e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    onClick: () => setStatsPreset(7)
  }, "Неделя"), /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    onClick: () => setStatsPreset(30)
  }, "Месяц")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 12
    }
  }, [{
    label: 'Отгружено, шт.',
    value: periodStats.shipped
  }, {
    label: 'Приход, шт.',
    value: periodStats.income
  }, {
    label: 'Брак, шт.',
    value: periodStats.defect
  }, {
    label: 'Фотостудия, шт.',
    value: periodStats.photo
  }, {
    label: 'Обезличка, шт.',
    value: periodStats.unidentified
  }, {
    label: 'Поставок',
    value: periodStats.shipmentsCount
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      padding: '12px 8px',
      border: '1px solid var(--line)',
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "skl-mono",
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: (s.label === 'Брак, шт.' || s.label === 'Обезличка, шт.') && s.value > 0 ? 'var(--negative)' : 'var(--ink)'
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-soft)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginTop: 4
    }
  }, s.label))))), /*#__PURE__*/React.createElement(Section, {
    title: "Поставки",
    icon: /*#__PURE__*/React.createElement(Search, {
      size: 18
    }),
    open: openSections.shipments,
    onToggle: () => toggleSection('shipments'),
    contentStyle: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    style: {
      maxWidth: 240
    },
    placeholder: "Поиск по номеру поставки",
    value: searchShipment,
    onChange: e => setSearchShipment(e.target.value)
  })), filteredShipmentList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: 'center',
      color: 'var(--ink-soft)'
    }
  }, "Поставок пока нет.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--paper)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '10px 18px',
      fontWeight: 600
    }
  }, "№ поставки"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '10px 18px',
      fontWeight: 600
    }
  }, "Дата приёмки"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '10px 18px',
      fontWeight: 600
    },
    className: "skl-mono"
  }, "Отгружено, шт."), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '10px 18px',
      fontWeight: 600
    },
    className: "skl-mono"
  }, "Брак, шт."), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, filteredShipmentList.map(s => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", {
    key: s.number,
    className: "skl-row",
    style: {
      borderTop: '1px solid var(--line)',
      cursor: 'pointer'
    },
    onClick: () => setExpandedShipment(expandedShipment === s.number ? null : s.number)
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 18px',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, expandedShipment === s.number ? /*#__PURE__*/React.createElement(ChevronDown, {
    size: 14
  }) : /*#__PURE__*/React.createElement(ChevronRight, {
    size: 14
  }), "№", s.number)), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '10px 18px'
    }
  }, fmtDate(s.date)), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '10px 18px',
      fontWeight: 700
    }
  }, s.total), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '10px 18px',
      color: s.defectTotal > 0 ? 'var(--negative)' : 'inherit'
    }
  }, s.defectTotal), /*#__PURE__*/React.createElement("td", null)), expandedShipment === s.number && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 5,
    style: {
      padding: '0 18px 16px 42px',
      background: 'var(--row-hover)'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse',
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--ink-soft)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Артикул"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Размер"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Тип"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Кол-во"))), /*#__PURE__*/React.createElement("tbody", null, [...s.items].sort((a, b) => a.article.localeCompare(b.article, undefined, {
    numeric: true
  })).map(it => /*#__PURE__*/React.createElement("tr", {
    key: it.id,
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px',
      fontWeight: 600
    }
  }, it.article), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px'
    }
  }, it.size), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "skl-stamp",
    style: {
      color: it.type === 'defect' ? 'var(--negative)' : 'var(--warn)'
    }
  }, it.type === 'defect' ? 'брак' : 'отгрузка')), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '4px 8px'
    }
  }, it.qty)))))))))))), unidentified.length > 0 && /*#__PURE__*/React.createElement(Section, {
    title: "Обезличка (неопознанный товар)",
    icon: /*#__PURE__*/React.createElement(AlertTriangle, {
      size: 18,
      color: "var(--warn)"
    }),
    open: openSections.unidentified,
    onToggle: () => toggleSection('unidentified')
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)',
      marginTop: 0,
      marginBottom: 12
    }
  }, "WB не смог определить артикул для этих единиц — учитывается отдельно от остатков по артикулам."), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--ink-soft)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Дата"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Поставка"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    },
    className: "skl-mono"
  }, "Кол-во"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, unidentified.map(u => /*#__PURE__*/React.createElement("tr", {
    key: u.id,
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '4px 8px'
    }
  }, fmtDate(u.date)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px'
    }
  }, u.shipmentNumber ? `№${u.shipmentNumber}` : '—'), /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '4px 8px',
      color: 'var(--negative)',
      fontWeight: 700
    }
  }, u.qty), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '4px 8px',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    style: {
      padding: '4px 8px'
    },
    onClick: () => deleteUnidentified(u.id)
  }, /*#__PURE__*/React.createElement(Trash2, {
    size: 12
  })))))))), /*#__PURE__*/React.createElement(Section, {
    title: "Последние действия",
    icon: /*#__PURE__*/React.createElement(Clock, {
      size: 18
    }),
    open: openSections.actions,
    onToggle: () => toggleSection('actions')
  }, actions.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)'
    }
  }, "Пока нет ни одного действия.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--ink-soft)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Когда"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Что произошло"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, actions.map(a => /*#__PURE__*/React.createElement("tr", {
    key: a.id,
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '6px 8px',
      whiteSpace: 'nowrap',
      color: 'var(--ink-soft)'
    }
  }, new Date(a.addedAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, a.label), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    style: {
      padding: '4px 8px'
    },
    onClick: () => undoAction(a.id),
    title: "Отменить это действие"
  }, /*#__PURE__*/React.createElement(Trash2, {
    size: 12
  })))))))), /*#__PURE__*/React.createElement(Section, {
    title: "Резервные копии (авто)",
    icon: /*#__PURE__*/React.createElement(Save, {
      size: 18
    }),
    open: openSections.backups,
    onToggle: () => toggleSection('backups')
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)',
      marginTop: 0,
      marginBottom: 12
    }
  }, "Раз в день при открытии сайта автоматически сохраняется полная копия данных. Хранятся последние ", BACKUP_KEEP, " дней."), backupList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)'
    }
  }, "Копий пока нет — появятся после первого дня работы.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--ink-soft)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '4px 8px',
      fontWeight: 500
    }
  }, "Дата копии"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, backupList.map(b => /*#__PURE__*/React.createElement("tr", {
    key: b.key,
    style: {
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "skl-mono",
    style: {
      padding: '6px 8px'
    }
  }, fmtDate(b.key.replace(BACKUP_PREFIX, ''))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-ghost",
    disabled: restoring,
    onClick: () => restoreBackup(b.key)
  }, "Восстановить")))))))), activeTab === 'receiving' && receivingContent, activeTab === 'main' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, {
    title: "Остатки по артикулам",
    icon: /*#__PURE__*/React.createElement(Box, {
      size: 18
    }),
    open: true,
    collapsible: false,
    contentStyle: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement(Search, {
    size: 14,
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--ink-soft)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "skl-input",
    style: {
      paddingLeft: 32
    },
    placeholder: "Поиск по артикулу или названию",
    value: mainSearch,
    onChange: e => setMainSearch(e.target.value)
  }))), summary.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: { marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }
  }, /*#__PURE__*/React.createElement("button", {
    className: "skl-btn skl-btn-primary",
    onClick: autofillGrids
  }, "Заполнить размерные сетки из приходов"), /*#__PURE__*/React.createElement("span", {
    style: { fontSize: 12, color: 'var(--ink-soft)' }
  }, "посчитает задвоенные размеры по данным приходов — потом можно поправить")), (() => {
    const cats = [...new Set(summary.map(s => articleCategory(s.article)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    if (cats.length < 2) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setMainCategory(''),
      className: "skl-btn " + (mainCategory === '' ? "skl-btn-primary" : "skl-btn-ghost")
    }, "Все"), ...cats.map(cat => /*#__PURE__*/React.createElement("button", {
      key: cat,
      onClick: () => setMainCategory(mainCategory === cat ? '' : cat),
      className: "skl-btn " + (mainCategory === cat ? "skl-btn-primary" : "skl-btn-ghost")
    }, cat)));
  })(), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: 'center',
      color: 'var(--ink-soft)'
    }
  }, "Загрузка данных…") : summary.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: 'center',
      color: 'var(--ink-soft)'
    }
  }, "Пока пусто. Добавь первый приход, чтобы начать учёт.") : (() => {
    const q = mainSearch.trim().toLowerCase();
    const filteredSummary = summary.filter(row =>
      (!q || row.article.toLowerCase().includes(q) || (names[row.article] || '').toLowerCase().includes(q) || articleCategory(row.article).toLowerCase().includes(q)) &&
      (!mainCategory || articleCategory(row.article) === mainCategory));
    return filteredSummary.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        textAlign: 'center',
        color: 'var(--ink-soft)'
      }
    }, "Ничего не найдено по запросу «", mainSearch, "».") : /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        background: 'var(--paper)',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '10px 18px',
        fontWeight: 600
      }
    }, "Артикул"), /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '10px 18px',
        fontWeight: 600
      },
      className: "skl-mono"
    }, "Остаток (коробов)"), /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '10px 18px',
        fontWeight: 600
      }
    }, "Статус"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, filteredSummary.map(row => {
      const boxesFull = Math.trunc(row.balance / BOX_SIZE);
      const remPairs = row.balance - boxesFull * BOX_SIZE;
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", {
        key: row.article,
        className: "skl-row",
        style: {
          borderTop: '1px solid var(--line)',
          cursor: 'pointer'
        },
        onClick: () => setExpanded(expanded === row.article ? null : row.article)
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '10px 18px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 600
        }
      }, expanded === row.article ? /*#__PURE__*/React.createElement(ChevronDown, {
        size: 14
      }) : /*#__PURE__*/React.createElement(ChevronRight, {
        size: 14
      }), row.article), articleCategory(row.article) && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--accent)',
          fontWeight: 600,
          marginLeft: 20
        }
      }, articleCategory(row.article))), /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '10px 18px',
          fontWeight: 700
        }
      }, boxesFull, remPairs !== 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 400,
          color: 'var(--ink-soft)'
        }
      }, " + ", remPairs, " пар"), (row.inWork > 0 || row.toWb > 0) && /*#__PURE__*/React.createElement("div", {
        style: { fontWeight: 400, fontSize: 11, color: 'var(--ink-soft)', marginTop: 3 }
      }, row.inWork > 0 ? `в работе: ${row.inWork}` : '', row.inWork > 0 && row.toWb > 0 ? ' · ' : '', row.toWb > 0 ? `принимается WB: ${row.toWb}` : '')), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '10px 18px'
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "skl-stamp",
        style: {
          color: row.balance > 0 ? 'var(--positive)' : row.balance === 0 ? 'var(--ink-soft)' : 'var(--negative)'
        }
      }, row.balance > 0 ? 'в наличии' : row.balance === 0 ? 'ноль' : 'дефицит')), /*#__PURE__*/React.createElement("td", null)), expanded === row.article && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
        colSpan: 4,
        style: {
          padding: '0 18px 18px 42px',
          background: 'var(--row-hover)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: { margin: '14px 0 6px' }
      }, /*#__PURE__*/React.createElement("div", {
        style: { fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
      }, "Размерная сетка короба (клик по размеру: нет / ×1 / ×2 · сумма = 8)"), sizeGridEditor(row.article)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--ink-soft)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: '12px 0 6px'
        }
      }, "По размерам"), /*#__PURE__*/React.createElement("table", {
        style: {
          width: '100%',
          fontSize: 13,
          borderCollapse: 'collapse',
          marginBottom: 12
        }
      }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
        style: {
          color: 'var(--ink-soft)',
          textAlign: 'left'
        }
      }, /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        }
      }, "Размер"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        },
        className: "skl-mono"
      }, "Приход"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        },
        className: "skl-mono"
      }, "Брак"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        },
        className: "skl-mono"
      }, "Фотостудия"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        },
        className: "skl-mono"
      }, "Отгружено"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        },
        className: "skl-mono"
      }, "Остаток"))), /*#__PURE__*/React.createElement("tbody", null, row.sizes.map(sz => /*#__PURE__*/React.createElement("tr", {
        key: sz.size,
        style: {
          borderTop: '1px solid var(--line)'
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '6px 8px',
          fontWeight: 600
        }
      }, sz.size), /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '6px 8px'
        }
      }, sz.income), /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '6px 8px',
          color: sz.defect > 0 ? 'var(--negative)' : 'inherit'
        }
      }, sz.defect), /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '6px 8px'
        }
      }, sz.photo), /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '6px 8px'
        }
      }, sz.shipped), /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '6px 8px',
          fontWeight: 700,
          color: sz.balance < 0 ? 'var(--negative)' : 'inherit'
        }
      }, sz.balance))))), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--ink-soft)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: '12px 0 6px'
        }
      }, "История движений"), /*#__PURE__*/React.createElement("table", {
        style: {
          width: '100%',
          fontSize: 13,
          borderCollapse: 'collapse'
        }
      }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
        style: {
          color: 'var(--ink-soft)',
          textAlign: 'left'
        }
      }, /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        }
      }, "Дата"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        }
      }, "Тип"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        }
      }, "Размер"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        },
        className: "skl-mono"
      }, "Кол-во"), /*#__PURE__*/React.createElement("th", {
        style: {
          padding: '6px 8px',
          fontWeight: 500
        }
      }, "Поставка / комментарий"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, historyFor(row.article).map(h => /*#__PURE__*/React.createElement("tr", {
        key: h.id,
        style: {
          borderTop: '1px solid var(--line)'
        }
      }, /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '6px 8px'
        }
      }, fmtDate(h.date)), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '6px 8px'
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "skl-stamp",
        style: {
          color: h.type === 'income' ? 'var(--positive)' : h.type === 'defect' || h.type === 'photo' ? 'var(--negative)' : 'var(--warn)'
        }
      }, h.type === 'income' ? 'приход' : h.type === 'defect' ? 'брак' : h.type === 'photo' ? 'фотостудия' : 'отгрузка')), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '6px 8px'
        }
      }, h.size), /*#__PURE__*/React.createElement("td", {
        className: "skl-mono",
        style: {
          padding: '6px 8px'
        }
      }, h.type === 'income' ? '+' : '−', h.qty), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '6px 8px',
          color: 'var(--ink-soft)'
        }
      }, h.shipmentNumber ? `№${h.shipmentNumber}` : h.warehouse || h.note || '—', h.type === 'photo' && h.consumedQty > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 6,
          fontSize: 11
        }
      }, "(учтено в браке: ", h.consumedQty, ")")), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '6px 8px',
          textAlign: 'right'
        }
      }, /*#__PURE__*/React.createElement("button", {
        className: "skl-btn skl-btn-ghost",
        style: {
          padding: '4px 8px'
        },
        onClick: () => h.type === 'income' ? deleteIncome(h.id) : h.type === 'defect' ? deleteDefect(h.id) : h.type === 'photo' ? deletePhoto(h.id) : deleteShipment(h.id)
      }, /*#__PURE__*/React.createElement(Trash2, {
        size: 12
      }))))))))));
    })));
  })())), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 12,
      color: 'var(--ink-soft)',
      textAlign: 'center'
    }
  }, "Данные хранятся в защищённой облачной базе — доступны после входа с любого устройства.")));
}
// Раньше здесь был запуск приложения. Теперь компонент отдаём наружу —
// его рендерит main.jsx через «ворота» входа (AuthGate).
window.SkladLedger = SkladLedger;

