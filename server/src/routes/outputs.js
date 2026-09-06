import { all, one } from '../db.js';
import { ROLES } from '../auth.js';

// Выработка привязана к конкретному выходу человека в смену (signup),
// поэтому по ней сразу видно и кто сделал, и в какую смену.
export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  // Своя выработка — всегда; чужая — старшему и руководителю.
  async function canTouch(req, signupId) {
    const row = await one(
      `SELECT su.id, su.employee_id, s.closed
       FROM shift_signups su JOIN shifts s ON s.id = su.shift_id
       WHERE su.id = $1`,
      [signupId],
    );
    if (!row) return { error: 'Выход в смену не найден', code: 404 };
    const own = row.employee_id === req.emp.id;
    if (!own && ROLES[req.emp.role] < ROLES.senior) {
      return { error: 'Можно вносить только свою выработку', code: 403 };
    }
    if (row.closed && ROLES[req.emp.role] < ROLES.senior) {
      return { error: 'Смена закрыта, изменить выработку нельзя', code: 400 };
    }
    return { row };
  }

  app.get('/', async (req) => all(
    `SELECT o.*, s.work_date, s.kind, e.id AS employee_id,
            e.last_name || ' ' || e.first_name AS employee_name
     FROM outputs o
     JOIN shift_signups su ON su.id = o.signup_id
     JOIN shifts s ON s.id = su.shift_id
     JOIN employees e ON e.id = su.employee_id
     WHERE ($1::uuid IS NULL OR su.shift_id = $1)
       AND ($2::uuid IS NULL OR su.employee_id = $2)
       AND ($3::date IS NULL OR s.work_date >= $3)
       AND ($4::date IS NULL OR s.work_date <= $4)
     ORDER BY s.work_date DESC, e.last_name`,
    [req.query.shift_id || null, req.query.employee_id || null,
     req.query.from || null, req.query.to || null],
  ));

  app.post('/', async (req, reply) => {
    const { signup_id, work_type, unit, quantity, comment } = req.body || {};
    if (!signup_id) return reply.code(400).send({ error: 'Не указана смена' });
    if (!['FBO', 'FBS'].includes(work_type)) {
      return reply.code(400).send({ error: 'Тип работы: ФБО или ФБС' });
    }
    if (!unit?.trim()) return reply.code(400).send({ error: 'Укажите единицу учёта' });
    if (!(Number(quantity) > 0)) return reply.code(400).send({ error: 'Количество должно быть больше нуля' });

    const check = await canTouch(req, signup_id);
    if (check.error) return reply.code(check.code).send({ error: check.error });

    return one(
      `INSERT INTO outputs (signup_id, work_type, unit, quantity, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [signup_id, work_type, unit.trim(), quantity, comment?.trim() || null],
    );
  });

  app.delete('/:id', async (req, reply) => {
    const row = await one('SELECT signup_id FROM outputs WHERE id = $1', [req.params.id]);
    if (!row) return reply.code(404).send({ error: 'Запись не найдена' });
    const check = await canTouch(req, row.signup_id);
    if (check.error) return reply.code(check.code).send({ error: check.error });
    await one('DELETE FROM outputs WHERE id = $1 RETURNING id', [req.params.id]);
    return { ok: true };
  });
}
