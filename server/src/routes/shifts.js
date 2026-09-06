import { all, one } from '../db.js';
import { requireRole } from '../auth.js';

// Смена вместе с составом: одним запросом, чтобы календарь не дёргал API по каждой дате.
const listSql = `
  SELECT s.*,
         COALESCE(j.signups, '[]'::json) AS signups,
         COALESCE(c.picker_count, 0)     AS picker_count,
         COALESCE(c.senior_count, 0)     AS senior_count,
         COALESCE(c.requested_count, 0)  AS requested_count
  FROM shifts s
  LEFT JOIN LATERAL (
    SELECT COUNT(*) FILTER (WHERE su.status = 'approved' AND e.role = 'picker') AS picker_count,
           COUNT(*) FILTER (WHERE su.status = 'approved' AND e.role = 'senior') AS senior_count,
           COUNT(*) FILTER (WHERE su.status = 'requested')                      AS requested_count
    FROM shift_signups su
    JOIN employees e ON e.id = su.employee_id
    WHERE su.shift_id = s.id
  ) c ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object(
             'id', su2.id, 'employee_id', e2.id, 'status', su2.status, 'role', e2.role,
             'last_name', e2.last_name, 'first_name', e2.first_name,
             'photo_path', e2.photo_path,
             'has_output', EXISTS (SELECT 1 FROM outputs o WHERE o.signup_id = su2.id)
           ) ORDER BY e2.role DESC, e2.last_name) AS signups
    FROM shift_signups su2
    JOIN employees e2 ON e2.id = su2.employee_id
    WHERE su2.shift_id = s.id AND su2.status IN ('requested','approved','no_show')
  ) j ON true
  WHERE s.work_date BETWEEN $1 AND $2
  ORDER BY s.work_date, s.kind`;

export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (req) => {
    const today = new Date().toISOString().slice(0, 10);
    const from = req.query.from || today;
    const to = req.query.to || from;
    return all(listSql, [from, to]);
  });

  app.post('/', { preHandler: [requireRole('senior')] }, async (req, reply) => {
    const { work_date, kind, need_picker = 0, need_senior = 0, note } = req.body || {};
    if (!work_date || !['day', 'night'].includes(kind)) {
      return reply.code(400).send({ error: 'Укажите дату и вид смены' });
    }
    return one(
      `INSERT INTO shifts (work_date, kind, need_picker, need_senior, note)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (work_date, kind) DO UPDATE
         SET need_picker = EXCLUDED.need_picker,
             need_senior = EXCLUDED.need_senior,
             note = EXCLUDED.note
       RETURNING *`,
      [work_date, kind, need_picker, need_senior, note || null],
    );
  });

  // Разметить сразу месяц: обе смены на каждый день диапазона.
  app.post('/bulk', { preHandler: [requireRole('senior')] }, async (req, reply) => {
    const { from, to, kinds = ['day', 'night'], need_picker = 0, need_senior = 0 } = req.body || {};
    if (!from || !to) return reply.code(400).send({ error: 'Укажите период' });
    const rows = await all(
      `INSERT INTO shifts (work_date, kind, need_picker, need_senior)
       SELECT d::date, k, $3, $4
       FROM generate_series($1::date, $2::date, interval '1 day') d
       CROSS JOIN unnest($5::text[]) k
       ON CONFLICT (work_date, kind) DO NOTHING
       RETURNING *`,
      [from, to, need_picker, need_senior, kinds],
    );
    return { created: rows.length, shifts: rows };
  });

  app.patch('/:id', { preHandler: [requireRole('senior')] }, async (req, reply) => {
    const { need_picker, need_senior, note, closed } = req.body || {};
    const shift = await one(
      `UPDATE shifts SET need_picker = COALESCE($2, need_picker),
                         need_senior = COALESCE($3, need_senior),
                         note = COALESCE($4, note),
                         closed = COALESCE($5, closed)
       WHERE id = $1 RETURNING *`,
      [req.params.id, need_picker ?? null, need_senior ?? null, note ?? null, closed ?? null],
    );
    if (!shift) return reply.code(404).send({ error: 'Смена не найдена' });
    return shift;
  });

  app.delete('/:id', { preHandler: [requireRole('admin')] }, async (req) => {
    await one('DELETE FROM shifts WHERE id = $1 RETURNING id', [req.params.id]);
    return { ok: true };
  });

  // ------------------------------------------------------------ запись на смену
  app.post('/:id/signup', async (req, reply) => {
    const shift = await one('SELECT * FROM shifts WHERE id = $1', [req.params.id]);
    if (!shift) return reply.code(404).send({ error: 'Смена не найдена' });
    if (shift.closed) return reply.code(400).send({ error: 'Смена закрыта, записаться нельзя' });
    return one(
      `INSERT INTO shift_signups (shift_id, employee_id, status)
       VALUES ($1, $2, 'requested')
       ON CONFLICT (shift_id, employee_id) DO UPDATE
         SET status = CASE WHEN shift_signups.status IN ('cancelled','rejected')
                           THEN 'requested' ELSE shift_signups.status END
       RETURNING *`,
      [req.params.id, req.emp.id],
    );
  });

  app.delete('/:id/signup', async (req, reply) => {
    const shift = await one('SELECT * FROM shifts WHERE id = $1', [req.params.id]);
    if (shift?.closed) return reply.code(400).send({ error: 'Смена закрыта' });
    await one(
      `UPDATE shift_signups SET status = 'cancelled'
       WHERE shift_id = $1 AND employee_id = $2 RETURNING id`,
      [req.params.id, req.emp.id],
    );
    return { ok: true };
  });

  // Старший может поставить человека в смену сам, минуя заявку.
  app.post('/:id/signups', { preHandler: [requireRole('senior')] }, async (req, reply) => {
    const { employee_id } = req.body || {};
    if (!employee_id) return reply.code(400).send({ error: 'Не выбран сотрудник' });
    return one(
      `INSERT INTO shift_signups (shift_id, employee_id, status, decided_by, decided_at)
       VALUES ($1, $2, 'approved', $3, now())
       ON CONFLICT (shift_id, employee_id) DO UPDATE
         SET status = 'approved', decided_by = $3, decided_at = now()
       RETURNING *`,
      [req.params.id, employee_id, req.emp.id],
    );
  });

  app.patch('/:id/signups/:signupId', { preHandler: [requireRole('senior')] }, async (req, reply) => {
    const { status } = req.body || {};
    if (!['approved', 'rejected', 'no_show', 'requested'].includes(status)) {
      return reply.code(400).send({ error: 'Недопустимый статус записи' });
    }
    const row = await one(
      `UPDATE shift_signups SET status = $3, decided_by = $4, decided_at = now()
       WHERE id = $1 AND shift_id = $2 RETURNING *`,
      [req.params.signupId, req.params.id, status, req.emp.id],
    );
    if (!row) return reply.code(404).send({ error: 'Запись не найдена' });
    return row;
  });

  // Мои смены: личный календарь и форма выработки берут данные отсюда.
  app.get('/my/list', async (req) => all(
    `SELECT su.id AS signup_id, su.status, s.id AS shift_id, s.work_date, s.kind, s.closed,
            COALESCE(p.total_amount, 0) AS pay,
            COALESCE((SELECT json_agg(json_build_object('id', o.id, 'work_type', o.work_type,
                                                        'unit', o.unit, 'quantity', o.quantity))
                      FROM outputs o WHERE o.signup_id = su.id), '[]'::json) AS outputs
     FROM shift_signups su
     JOIN shifts s ON s.id = su.shift_id
     LEFT JOIN v_shift_pay p ON p.signup_id = su.id
     WHERE su.employee_id = $1 AND su.status <> 'cancelled'
       AND s.work_date >= COALESCE($2::date, current_date - interval '60 days')
     ORDER BY s.work_date DESC, s.kind`,
    [req.emp.id, req.query.from || null],
  ));
}
