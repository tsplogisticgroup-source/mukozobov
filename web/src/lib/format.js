export const ROLE_NAME = {
  admin: 'Руководитель склада',
  senior: 'Старший смены',
  picker: 'Комплектовщик',
};

export const ROLE_SHORT = { admin: 'Рук.', senior: 'Старший', picker: 'Комплектовщик' };

export const KIND_NAME = { day: 'Дневная', night: 'Ночная' };

export const STATUS_NAME = {
  requested: 'Заявка',
  approved: 'Подтверждён',
  rejected: 'Отклонён',
  cancelled: 'Отменена',
  no_show: 'Не вышел',
};

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

// Даты приходят строками «2026-09-06» — парсим руками, чтобы часовой пояс
// не сдвинул смену на сутки.
export function parseDate(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const dayNum = (iso) => parseDate(iso).getDate();
export const monthShort = (iso) => MONTHS_SHORT[parseDate(iso).getMonth()];
export const weekday = (iso) => WEEKDAYS[parseDate(iso).getDay()];
export const isWeekend = (iso) => [0, 6].includes(parseDate(iso).getDay());

export const longDate = (iso) => {
  const d = parseDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const monthTitle = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_NOM[m - 1]} ${y}`;
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const monthISO = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthISO(d);
}

export function monthBounds(ym) {
  const [y, m] = ym.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${ym}-01`, to: `${ym}-${String(last).padStart(2, '0')}` };
}

export const money = (v) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(Number(v) || 0));

export const qty = (v) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(Number(v) || 0);

export const initials = (emp) =>
  `${(emp?.last_name || '?')[0] || ''}${(emp?.first_name || '')[0] || ''}`.toUpperCase();

// 79101110001 → +7 910 111-00-01
export const phoneView = (raw) => {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length !== 11) return raw;
  return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
};

export const fullName = (emp) =>
  [emp?.last_name, emp?.first_name, emp?.middle_name].filter(Boolean).join(' ');

// «5 смен», «21 смена» — иначе отчёт читается коряво
export function plural(n, one, few, many) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}
