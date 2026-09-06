import { all, one } from '../db.js';
import { requireRole } from '../auth.js';

// Ставки правит только руководитель. Новая ставка не переписывает старую,
// а добавляется с датой начала действия — прошлые месяцы не «переcчитываются».
export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  // Действующие ставки видит и старший — ему нужно понимать стоимость смены.
  app.get('/shift', { preHandler: [requireRole('senior')] }, async (req) => all(
    `SELECT DISTINCT ON (role, kind) id, role, kind, amount, effective_from
     FROM shift_rates WHERE effective_from <= COALESCE($1::date, current_date)
     ORDER BY role, kind, effective_from DESC`,
    [req.query.on || null],
  ));

  app.get('/shift/history', { preHandler: [requireRole('admin')] }, async () => all(
    'SELECT * FROM shift_rates ORDER BY effective_from DESC, role, kind'));

  app.post('/shift', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { role, kind, amount, effective_from } = req.body || {};
    if (!['admin', 'senior', 'picker'].includes(role)) {
      return reply.code(400).send({ error: 'Неизвестная роль' });
    }
    if (!['day', 'night'].includes(kind)) {
      return reply.code(400).send({ error: 'Вид смены: day или night' });
    }
    if (!(Number(amount) >= 0)) return reply.code(400).send({ error: 'Некорректная сумма' });
    return one(
      `INSERT INTO shift_rates (role, kind, amount, effective_from)
       VALUES ($1, $2, $3, COALESCE($4, current_date))
       ON CONFLICT (role, kind, effective_from) DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [role, kind, amount, effective_from || null],
    );
  });

  app.get('/piece', async (req) => all(
    `SELECT DISTINCT ON (work_type, unit) id, work_type, unit, amount, effective_from
     FROM piece_rates WHERE effective_from <= COALESCE($1::date, current_date)
     ORDER BY work_type, unit, effective_from DESC`,
    [req.query.on || null],
  ));

  app.post('/piece', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { work_type, unit, amount, effective_from } = req.body || {};
    if (!['FBO', 'FBS'].includes(work_type)) {
      return reply.code(400).send({ error: 'Тип работы: ФБО или ФБС' });
    }
    if (!unit?.trim()) return reply.code(400).send({ error: 'Укажите единицу учёта' });
    if (!(Number(amount) >= 0)) return reply.code(400).send({ error: 'Некорректная сумма' });
    return one(
      `INSERT INTO piece_rates (work_type, unit, amount, effective_from)
       VALUES ($1, $2, $3, COALESCE($4, current_date))
       ON CONFLICT (work_type, unit, effective_from) DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [work_type, unit.trim(), amount, effective_from || null],
    );
  });

  app.delete('/piece/:id', { preHandler: [requireRole('admin')] }, async (req) => {
    await one('DELETE FROM piece_rates WHERE id = $1 RETURNING id', [req.params.id]);
    return { ok: true };
  });
}
