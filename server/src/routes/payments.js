import { all, one } from '../db.js';
import { requireRole } from '../auth.js';

// Деньги: выплаты и штрафы. Сотрудник видит только свои, руководитель — все.
export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  // За что начислены деньги: список смен с датой, видом и суммой.
  const earningsOf = (employeeId) => all(
    `SELECT signup_id, work_date, kind, shift_amount, piece_amount, total_amount, shift_closed
     FROM v_shift_pay WHERE employee_id = $1
     ORDER BY work_date DESC, kind LIMIT 200`,
    [employeeId],
  );

  // Мой лицевой счёт: начислено, удержано, выплачено, остаток — и вся история.
  app.get('/me', async (req) => {
    const balance = await one(
      'SELECT * FROM v_employee_balance WHERE employee_id = $1', [req.emp.id]);
    const earnings = await earningsOf(req.emp.id);
    const payments = await all(
      `SELECT id, amount, paid_on, method, comment FROM payments
       WHERE employee_id = $1 ORDER BY paid_on DESC, created_at DESC LIMIT 100`,
      [req.emp.id]);
    const penalties = await all(
      `SELECT id, amount, reason, penalty_on FROM penalties
       WHERE employee_id = $1 ORDER BY penalty_on DESC, created_at DESC LIMIT 100`,
      [req.emp.id]);
    return { balance, earnings, payments, penalties };
  });

  // Кому и сколько должны — главный экран раздела «Выплаты».
  app.get('/debts', { preHandler: [requireRole('admin')] }, async () => {
    const rows = await all(
      `SELECT * FROM v_employee_balance
       WHERE status <> 'pending'
         AND (earned > 0 OR paid > 0 OR penalty > 0 OR pending > 0)
       ORDER BY balance DESC, employee_name`);
    const totals = rows.reduce((acc, r) => ({
      earned: acc.earned + Number(r.earned),
      penalty: acc.penalty + Number(r.penalty),
      paid: acc.paid + Number(r.paid),
      balance: acc.balance + Number(r.balance),
      pending: acc.pending + Number(r.pending),
    }), { earned: 0, penalty: 0, paid: 0, balance: 0, pending: 0 });
    return { rows, totals };
  });

  // Лицевой счёт конкретного сотрудника со всей историей.
  app.get('/employee/:id', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const balance = await one(
      'SELECT * FROM v_employee_balance WHERE employee_id = $1', [req.params.id]);
    if (!balance) return reply.code(404).send({ error: 'Сотрудник не найден' });
    const payments = await all(
      `SELECT p.id, p.amount, p.paid_on, p.method, p.comment,
              a.last_name || ' ' || a.first_name AS created_by_name
       FROM payments p LEFT JOIN employees a ON a.id = p.created_by
       WHERE p.employee_id = $1 ORDER BY p.paid_on DESC, p.created_at DESC`,
      [req.params.id]);
    const penalties = await all(
      `SELECT f.id, f.amount, f.reason, f.penalty_on,
              a.last_name || ' ' || a.first_name AS created_by_name
       FROM penalties f LEFT JOIN employees a ON a.id = f.created_by
       WHERE f.employee_id = $1 ORDER BY f.penalty_on DESC, f.created_at DESC`,
      [req.params.id]);
    const earnings = await earningsOf(req.params.id);
    return { balance, earnings, payments, penalties };
  });

  // ------------------------------------------------------------------ выплаты
  app.post('/', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { employee_id, amount, paid_on, method, comment } = req.body || {};
    if (!employee_id) return reply.code(400).send({ error: 'Не выбран сотрудник' });
    if (!(Number(amount) > 0)) return reply.code(400).send({ error: 'Сумма должна быть больше нуля' });
    if (method && !['cash', 'card', 'account'].includes(method)) {
      return reply.code(400).send({ error: 'Неизвестный способ выплаты' });
    }
    const emp = await one('SELECT id FROM employees WHERE id = $1', [employee_id]);
    if (!emp) return reply.code(404).send({ error: 'Сотрудник не найден' });

    return one(
      `INSERT INTO payments (employee_id, amount, paid_on, method, comment, created_by)
       VALUES ($1, $2, COALESCE($3, current_date), COALESCE($4, 'cash'), $5, $6)
       RETURNING *`,
      [employee_id, amount, paid_on || null, method || null,
       comment?.trim() || null, req.emp.id],
    );
  });

  app.delete('/:id', { preHandler: [requireRole('admin')] }, async (req) => {
    await one('DELETE FROM payments WHERE id = $1 RETURNING id', [req.params.id]);
    return { ok: true };
  });

  // ------------------------------------------------------------------- штрафы
  app.post('/penalties', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { employee_id, amount, reason, penalty_on, signup_id } = req.body || {};
    if (!employee_id) return reply.code(400).send({ error: 'Не выбран сотрудник' });
    if (!(Number(amount) > 0)) return reply.code(400).send({ error: 'Сумма должна быть больше нуля' });
    if (!reason?.trim()) return reply.code(400).send({ error: 'Укажите причину штрафа' });

    return one(
      `INSERT INTO penalties (employee_id, amount, reason, penalty_on, signup_id, created_by)
       VALUES ($1, $2, $3, COALESCE($4, current_date), $5, $6) RETURNING *`,
      [employee_id, amount, reason.trim(), penalty_on || null, signup_id || null, req.emp.id],
    );
  });

  app.delete('/penalties/:id', { preHandler: [requireRole('admin')] }, async (req) => {
    await one('DELETE FROM penalties WHERE id = $1 RETURNING id', [req.params.id]);
    return { ok: true };
  });
}
