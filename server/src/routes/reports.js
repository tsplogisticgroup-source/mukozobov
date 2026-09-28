import { all } from '../db.js';
import { requireRole } from '../auth.js';

// Границы месяца из строки «2026-09».
function monthRange(month) {
  const m = /^\d{4}-\d{2}$/.test(month || '') ? month : new Date().toISOString().slice(0, 7);
  return { from: `${m}-01`, month: m };
}

const IN_MONTH = `work_date >= $1::date AND work_date < ($1::date + interval '1 month')`;

export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  // Затраты на персонал за месяц — только собственник.
  app.get('/payroll', { preHandler: [requireRole('owner')] }, async (req) => {
    const { from, month } = monthRange(req.query.month);

    const byEmployee = await all(
      `SELECT employee_id, employee_name, role,
              COUNT(*)                               AS shifts_count,
              COUNT(*) FILTER (WHERE kind = 'day')   AS day_count,
              COUNT(*) FILTER (WHERE kind = 'night') AS night_count,
              SUM(hours)                             AS hours,
              SUM(total_amount)                      AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND ${IN_MONTH}
       GROUP BY employee_id, employee_name, role
       ORDER BY total_amount DESC`,
      [from],
    );

    const byRole = await all(
      `SELECT role, kind, COUNT(*) AS shifts_count, SUM(hours) AS hours, SUM(total_amount) AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND ${IN_MONTH}
       GROUP BY role, kind ORDER BY role, kind`,
      [from],
    );

    const byDay = await all(
      `SELECT work_date, kind, COUNT(*) AS people, SUM(hours) AS hours, SUM(total_amount) AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND ${IN_MONTH}
       GROUP BY work_date, kind ORDER BY work_date, kind`,
      [from],
    );

    const totals = byEmployee.reduce(
      (acc, r) => ({
        shifts_count: acc.shifts_count + Number(r.shifts_count),
        hours: acc.hours + Number(r.hours || 0),
        total_amount: acc.total_amount + Number(r.total_amount || 0),
        people: acc.people + 1,
      }),
      { shifts_count: 0, hours: 0, total_amount: 0, people: 0 },
    );

    return { month, totals, byEmployee, byRole, byDay };
  });

  // План и факт за месяц по маркетплейсам. Доступно старшему — денег тут нет.
  app.get('/volumes', { preHandler: [requireRole('senior')] }, async (req) => {
    const { from, month } = monthRange(req.query.month);

    const byLine = await all(
      `SELECT v.marketplace, v.work_type, v.unit,
              SUM(v.quantity) FILTER (WHERE v.kind = 'plan') AS plan,
              SUM(v.quantity) FILTER (WHERE v.kind = 'fact') AS fact
       FROM shift_volumes v
       JOIN shifts s ON s.id = v.shift_id
       WHERE s.${IN_MONTH}
       GROUP BY v.marketplace, v.work_type, v.unit
       ORDER BY v.marketplace, v.work_type, v.unit`,
      [from],
    );

    const byDay = await all(
      `SELECT s.work_date, s.kind AS shift_kind, v.marketplace, v.work_type, v.unit,
              SUM(v.quantity) FILTER (WHERE v.kind = 'plan') AS plan,
              SUM(v.quantity) FILTER (WHERE v.kind = 'fact') AS fact
       FROM shift_volumes v
       JOIN shifts s ON s.id = v.shift_id
       WHERE s.${IN_MONTH}
       GROUP BY s.work_date, s.kind, v.marketplace, v.work_type, v.unit
       ORDER BY s.work_date, s.kind, v.marketplace, v.work_type, v.unit`,
      [from],
    );

    return { month, byLine, byDay };
  });

  // Отгрузки за месяц: сколько уехало на ВБ и Озон, кто возил.
  app.get('/shipments', { preHandler: [requireRole('senior')] }, async (req) => {
    const { from, month } = monthRange(req.query.month);

    const rows = await all(
      `SELECT sh.id, s.work_date, s.kind AS shift_kind, sh.marketplace, sh.destination,
              sh.pallets, sh.boxes, sh.comment, d.name AS driver_name, d.vehicle AS driver_vehicle
       FROM shipments sh
       JOIN shifts s ON s.id = sh.shift_id
       LEFT JOIN drivers d ON d.id = sh.driver_id
       WHERE s.${IN_MONTH}
       ORDER BY s.work_date DESC, sh.created_at DESC`,
      [from],
    );

    const byMarketplace = await all(
      `SELECT sh.marketplace, COUNT(*) AS trips, SUM(sh.pallets) AS pallets, SUM(sh.boxes) AS boxes
       FROM shipments sh JOIN shifts s ON s.id = sh.shift_id
       WHERE s.${IN_MONTH}
       GROUP BY sh.marketplace ORDER BY sh.marketplace`,
      [from],
    );

    const byDriver = await all(
      `SELECT COALESCE(d.name, '— без водителя —') AS driver_name,
              COUNT(*) AS trips, SUM(sh.pallets) AS pallets, SUM(sh.boxes) AS boxes
       FROM shipments sh JOIN shifts s ON s.id = sh.shift_id
       LEFT JOIN drivers d ON d.id = sh.driver_id
       WHERE s.${IN_MONTH}
       GROUP BY d.name ORDER BY trips DESC`,
      [from],
    );

    return { month, rows, byMarketplace, byDriver };
  });

  // Табель: кто в какие дни выходил и сколько часов.
  app.get('/timesheet', { preHandler: [requireRole('senior')] }, async (req) => {
    const { from, month } = monthRange(req.query.month);
    const rows = await all(
      `SELECT e.id AS employee_id, e.last_name || ' ' || e.first_name AS employee_name, e.role,
              s.work_date, s.kind, su.status, su.hours
       FROM shift_signups su
       JOIN shifts s ON s.id = su.shift_id
       JOIN employees e ON e.id = su.employee_id
       WHERE s.${IN_MONTH} AND su.status IN ('approved', 'no_show')
       ORDER BY e.last_name, s.work_date`,
      [from],
    );
    return { month, rows };
  });

  // Выгрузка расчёта в CSV — открывается в Excel, разделитель «;» как в русской локали.
  app.get('/payroll.csv', { preHandler: [requireRole('owner')] }, async (req, reply) => {
    const { from, month } = monthRange(req.query.month);
    const rows = await all(
      `SELECT employee_name, role, COUNT(*) AS shifts_count, SUM(hours) AS hours,
              SUM(total_amount) AS total_amount
       FROM v_shift_pay
       WHERE shift_closed AND ${IN_MONTH}
       GROUP BY employee_name, role ORDER BY employee_name`,
      [from],
    );
    const roleName = {
      owner: 'Собственник', admin: 'Руководитель склада', senior: 'Старший смены', picker: 'Комплектовщик',
    };
    const head = 'Сотрудник;Должность;Смен;Часов;Итого, руб.';
    const body = rows.map((r) => [
      r.employee_name, roleName[r.role] || r.role, r.shifts_count, r.hours, r.total_amount,
    ].join(';'));
    // BOM, иначе Excel открывает кириллицу кракозябрами
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="payroll-${month}.csv"`);
    return '﻿' + [head, ...body].join('\r\n');
  });
}
