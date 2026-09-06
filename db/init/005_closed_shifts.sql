-- Деньги начисляются только за отработанные смены.
-- Пока смена не закрыта старшим, она считается «ожидает закрытия»:
-- человек записан, но платить за неё ещё не за что.

-- В расчёт оплаты добавляем признак закрытия смены.
CREATE OR REPLACE VIEW v_shift_pay AS
SELECT
  su.id                AS signup_id,
  s.id                 AS shift_id,
  s.work_date,
  s.kind,
  e.id                 AS employee_id,
  e.last_name || ' ' || e.first_name AS employee_name,
  e.role,
  su.status,
  COALESCE(pers.amount, base.amount, 0)          AS shift_amount,
  COALESCE(piece.amount, 0)                      AS piece_amount,
  COALESCE(pers.amount, base.amount, 0) + COALESCE(piece.amount, 0) AS total_amount,
  s.closed                                       AS shift_closed
FROM shift_signups su
JOIN shifts    s ON s.id = su.shift_id
JOIN employees e ON e.id = su.employee_id

LEFT JOIN LATERAL (
  SELECT r.amount FROM shift_rates r
  WHERE r.role = e.role AND r.kind = s.kind AND r.effective_from <= s.work_date
  ORDER BY r.effective_from DESC LIMIT 1
) base ON true

LEFT JOIN LATERAL (
  SELECT er.amount FROM employee_rates er
  WHERE er.employee_id = e.id AND er.kind = s.kind AND er.effective_from <= s.work_date
  ORDER BY er.effective_from DESC LIMIT 1
) pers ON true

LEFT JOIN LATERAL (
  SELECT SUM(o.quantity * COALESCE(pr.amount, 0)) AS amount
  FROM outputs o
  LEFT JOIN LATERAL (
    SELECT p.amount FROM piece_rates p
    WHERE p.work_type = o.work_type AND p.unit = o.unit AND p.effective_from <= s.work_date
    ORDER BY p.effective_from DESC LIMIT 1
  ) pr ON true
  WHERE o.signup_id = su.id
) piece ON true
WHERE su.status = 'approved';

-- Лицевой счёт: в долг идут только закрытые смены.
-- pending — заработано на сменах, которые ещё не закрыты.
CREATE OR REPLACE VIEW v_employee_balance AS
SELECT
  e.id                                   AS employee_id,
  e.last_name || ' ' || e.first_name     AS employee_name,
  e.role,
  e.status,
  e.photo_path,
  COALESCE(w.earned, 0)                  AS earned,
  COALESCE(w.shifts_count, 0)            AS shifts_count,
  COALESCE(f.penalty, 0)                 AS penalty,
  COALESCE(p.paid, 0)                    AS paid,
  COALESCE(w.earned, 0) - COALESCE(f.penalty, 0) - COALESCE(p.paid, 0) AS balance,
  COALESCE(w.pending, 0)                 AS pending,
  COALESCE(w.pending_count, 0)           AS pending_count
FROM employees e
LEFT JOIN LATERAL (
  SELECT
    SUM(total_amount) FILTER (WHERE shift_closed)       AS earned,
    COUNT(*)          FILTER (WHERE shift_closed)       AS shifts_count,
    SUM(total_amount) FILTER (WHERE NOT shift_closed)   AS pending,
    COUNT(*)          FILTER (WHERE NOT shift_closed)   AS pending_count
  FROM v_shift_pay v WHERE v.employee_id = e.id
) w ON true
LEFT JOIN LATERAL (
  SELECT SUM(amount) AS penalty FROM penalties WHERE employee_id = e.id
) f ON true
LEFT JOIN LATERAL (
  SELECT SUM(amount) AS paid FROM payments WHERE employee_id = e.id
) p ON true;
