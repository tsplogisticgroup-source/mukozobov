import { all } from '../db.js';
import { requireRole } from '../auth.js';

// Границы месяца из строки «2026-09». Всё, что про деньги, считается по этим датам.
function monthRange(month) {
  const m = /^\d{4}-\d{2}$/.test(month || '') ? month : new Date().toISOString().slice(0, 7);
  return { from: `${m}-01`, month: m };
}

export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  // Затраты на персонал за месяц. Только руководитель — это зарплатные данные.
  app.get('/payroll', { preHandler: [requireRole('admin')] }, async (req) => {
    const { from, month } = monthRange(req.query.month);

    const byEmployee = await all(
      `SELECT employee_id, employee_name, role,
              COUNT(*)                                      AS shifts_count,
              COUNT(*) FILTER (WHERE kind = 'day')          AS day_count,
              COUNT(*) FILTER (WHERE kind = 'night')        AS night_count,
              SUM(shift_amount)                             AS shift_amount,
              SUM(piece_amount)                             AS piece_amount,
              SUM(total_amount)                             AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND work_date >= $1::date AND work_date < ($1::date + interval '1 month')
       GROUP BY employee_id, employee_name, role
       ORDER BY total_amount DESC`,
      [from],
    );

    const byRole = await all(
      `SELECT role, kind, COUNT(*) AS shifts_count, SUM(total_amount) AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND work_date >= $1::date AND work_date < ($1::date + interval '1 month')
       GROUP BY role, kind ORDER BY role, kind`,
      [from],
    );

    const byDay = await all(
      `SELECT work_date, kind, COUNT(*) AS people, SUM(total_amount) AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND work_date >= $1::date AND work_date < ($1::date + interval '1 month')
       GROUP BY work_date, kind ORDER BY work_date, kind`,
      [from],
    );

    const totals = byEmployee.reduce(
      (acc, r) => ({
        shifts_count: acc.shifts_count + Number(r.shifts_count),
        shift_amount: acc.shift_amount + Number(r.shift_amount || 0),
        piece_amount: acc.piece_amount + Number(r.piece_amount || 0),
        total_amount: acc.total_amount + Number(r.total_amount || 0),
        people: acc.people + 1,
      }),
      { shifts_count: 0, shift_amount: 0, piece_amount: 0, total_amount: 0, people: 0 },
    );

    return { month, totals, byEmployee, byRole, byDay };
  });

  // Выработка за период: сколько сделано по ФБО и ФБС. Доступно старшему.
  app.get('/output', { preHandler: [requireRole('senior')] }, async (req) => {
    const { from, month } = monthRange(req.query.month);

    const byType = await all(
      `SELECT o.work_type, o.unit, SUM(o.quantity) AS quantity, COUNT(DISTINCT su.id) AS shifts
       FROM outputs o
       JOIN shift_signups su ON su.id = o.signup_id
       JOIN shifts s ON s.id = su.shift_id
       WHERE s.work_date >= $1::date AND s.work_date < ($1::date + interval '1 month')
       GROUP BY o.work_type, o.unit ORDER BY o.work_type, o.unit`,
      [from],
    );

    const byEmployee = await all(
      `SELECT e.id AS employee_id, e.last_name || ' ' || e.first_name AS employee_name,
              o.work_type, o.unit, SUM(o.quantity) AS quantity
       FROM outputs o
       JOIN shift_signups su ON su.id = o.signup_id
       JOIN shifts s ON s.id = su.shift_id
       JOIN employees e ON e.id = su.employee_id
       WHERE s.work_date >= $1::date AND s.work_date < ($1::date + interval '1 month')
       GROUP BY e.id, employee_name, o.work_type, o.unit
       ORDER BY employee_name`,
      [from],
    );

    return { month, byType, byEmployee };
  });

  // Табель: кто в какие дни выходил. Нужен старшему для планирования.
  app.get('/timesheet', { preHandler: [requireRole('senior')] }, async (req) => {
    const { from, month } = monthRange(req.query.month);
    const rows = await all(
      `SELECT e.id AS employee_id, e.last_name || ' ' || e.first_name AS employee_name, e.role,
              s.work_date, s.kind, su.status
       FROM shift_signups su
       JOIN shifts s ON s.id = su.shift_id
       JOIN employees e ON e.id = su.employee_id
       WHERE s.work_date >= $1::date AND s.work_date < ($1::date + interval '1 month')
         AND su.status IN ('approved', 'no_show')
       ORDER BY e.last_name, s.work_date`,
      [from],
    );
    return { month, rows };
  });

  // Выгрузка расчёта в CSV — открывается в Excel, разделитель «;» как в русской локали.
  app.get('/payroll.csv', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { from, month } = monthRange(req.query.month);
    const rows = await all(
      `SELECT employee_name, role, COUNT(*) AS shifts_count,
              SUM(shift_amount) AS shift_amount, SUM(piece_amount) AS piece_amount,
              SUM(total_amount) AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND work_date >= $1::date AND work_date < ($1::date + interval '1 month')
       GROUP BY employee_name, role ORDER BY employee_name`,
      [from],
    );
    const roleName = { admin: 'Руководитель', senior: 'Старший смены', picker: 'Комплектовщик' };
    const head = 'Сотрудник;Должность;Смен;Ставки, руб.;Сдельно, руб.;Итого, руб.';
    const body = rows.map((r) => [
      r.employee_name, roleName[r.role] || r.role, r.shifts_count,
      r.shift_amount, r.piece_amount, r.total_amount,
    ].join(';'));
    // BOM, иначе Excel открывает кириллицу кракозябрами
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="payroll-${month}.csv"`);
    return '﻿' + [head, ...body].join('\r\n');
  });
}
