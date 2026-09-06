import pg from 'pg';

// numeric приходит из pg строкой — для сумм это неудобно, приводим к числу
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v)));

// DATE драйвер по умолчанию отдаёт объектом Date в местном поясе, и в JSON
// смена уезжает на сутки назад. Дата смены — календарный день, а не момент
// времени, поэтому оставляем её строкой «2026-09-06».
pg.types.setTypeParser(1082, (v) => v);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const q = (text, params) => pool.query(text, params);

export async function one(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

export async function all(text, params) {
  const { rows } = await pool.query(text, params);
  return rows;
}
