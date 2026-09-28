import { all, one } from '../db.js';
import { requireRole } from '../auth.js';

// Единицы учёта для плана и выработки: пары, короба, паллеты, заказы.
// Видят все — они нужны в формах; правит руководитель склада или собственник.
export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async () => all(
    'SELECT id, work_type, unit, sort FROM volume_units ORDER BY work_type, sort, unit'));

  app.post('/', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { work_type, unit } = req.body || {};
    if (!['FBO', 'FBS'].includes(work_type)) {
      return reply.code(400).send({ error: 'Тип работы: ФБО или ФБС' });
    }
    if (!unit?.trim()) return reply.code(400).send({ error: 'Укажите единицу' });
    return one(
      `INSERT INTO volume_units (work_type, unit, sort)
       VALUES ($1, $2, (SELECT COALESCE(MAX(sort), 0) + 1 FROM volume_units WHERE work_type = $1))
       ON CONFLICT (work_type, unit) DO UPDATE SET unit = EXCLUDED.unit
       RETURNING *`,
      [work_type, unit.trim()],
    );
  });

  app.delete('/:id', { preHandler: [requireRole('admin')] }, async (req) => {
    await one('DELETE FROM volume_units WHERE id = $1 RETURNING id', [req.params.id]);
    return { ok: true };
  });
}
