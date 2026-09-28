import { all, one } from '../db.js';
import { requireRole } from '../auth.js';

// Справочник водителей для отгрузок. Смотреть может старший — он оформляет
// отгрузку; заводить и править — руководитель склада и собственник.
export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', { preHandler: [requireRole('senior')] }, async (req) => all(
    `SELECT * FROM drivers
     WHERE ($1::boolean IS NULL OR active = $1)
     ORDER BY active DESC, name`,
    [req.query.all === '1' ? null : true],
  ));

  app.post('/', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { name, phone, vehicle } = req.body || {};
    if (!name?.trim()) return reply.code(400).send({ error: 'Укажите имя водителя' });
    return one(
      'INSERT INTO drivers (name, phone, vehicle) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), phone?.trim() || null, vehicle?.trim() || null],
    );
  });

  app.patch('/:id', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { name, phone, vehicle, active } = req.body || {};
    const row = await one(
      `UPDATE drivers SET name = COALESCE($2, name), phone = COALESCE($3, phone),
                          vehicle = COALESCE($4, vehicle), active = COALESCE($5, active)
       WHERE id = $1 RETURNING *`,
      [req.params.id, name?.trim() || null, phone?.trim() ?? null,
       vehicle?.trim() ?? null, active ?? null],
    );
    if (!row) return reply.code(404).send({ error: 'Водитель не найден' });
    return row;
  });

  // Удаляем только если ни одной отгрузки на нём нет, иначе — в архив.
  app.delete('/:id', { preHandler: [requireRole('admin')] }, async (req) => {
    const used = await one('SELECT 1 FROM shipments WHERE driver_id = $1 LIMIT 1', [req.params.id]);
    if (used) {
      await one('UPDATE drivers SET active = false WHERE id = $1 RETURNING id', [req.params.id]);
      return { ok: true, archived: true };
    }
    await one('DELETE FROM drivers WHERE id = $1 RETURNING id', [req.params.id]);
    return { ok: true };
  });
}
