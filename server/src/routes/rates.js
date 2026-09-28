import { all, one } from '../db.js';
import { requireRole } from '../auth.js';

// Ставки за час — только собственник. Новая ставка не переписывает старую,
// а добавляется с датой начала действия: прошлые месяцы не пересчитываются.
export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/shift', { preHandler: [requireRole('owner')] }, async (req) => all(
    `SELECT DISTINCT ON (role, kind) id, role, kind, amount, effective_from
     FROM shift_rates WHERE effective_from <= COALESCE($1::date, current_date)
     ORDER BY role, kind, effective_from DESC`,
    [req.query.on || null],
  ));

  app.get('/shift/history', { preHandler: [requireRole('owner')] }, async () => all(
    'SELECT * FROM shift_rates ORDER BY effective_from DESC, role, kind'));

  app.post('/shift', { preHandler: [requireRole('owner')] }, async (req, reply) => {
    const { role, kind, amount, effective_from } = req.body || {};
    if (!['owner', 'admin', 'senior', 'picker'].includes(role)) {
      return reply.code(400).send({ error: 'Неизвестная должность' });
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
}
