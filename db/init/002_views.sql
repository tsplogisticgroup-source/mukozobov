-- Расчёт оплаты. Всё считается в БД, чтобы отчёты и личный кабинет
-- показывали одни и те же цифры.

-- Оплата одного выхода: ставка за смену + сдельная доплата за выработку.
-- Ставка берётся на дату смены: персональная, если задана, иначе типовая по роли.
-- Не вышел (no_show), отклонён, отменил — не оплачивается.
CREATE VIEW v_shift_pay AS
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
  COALESCE(pers.amount, base.amount, 0) + COALESCE(piece.amount, 0) AS total_amount
FROM shift_signups su
JOIN shifts    s ON s.id = su.shift_id
JOIN employees e ON e.id = su.employee_id

-- типовая ставка по роли и виду смены на дату смены
LEFT JOIN LATERAL (
  SELECT r.amount FROM shift_rates r
  WHERE r.role = e.role AND r.kind = s.kind AND r.effective_from <= s.work_date
  ORDER BY r.effective_from DESC LIMIT 1
) base ON true

-- персональная ставка сотрудника, если задана
LEFT JOIN LATERAL (
  SELECT er.amount FROM employee_rates er
  WHERE er.employee_id = e.id AND er.kind = s.kind AND er.effective_from <= s.work_date
  ORDER BY er.effective_from DESC LIMIT 1
) pers ON true

-- сдельная доплата: сумма по всей выработке этого выхода
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

-- Итоги по месяцам: сколько выходов и сколько денег.
CREATE VIEW v_month_totals AS
SELECT
  to_char(work_date, 'YYYY-MM') AS month,
  role,
  kind,
  COUNT(*)              AS shifts_count,
  SUM(shift_amount)     AS shift_amount,
  SUM(piece_amount)     AS piece_amount,
  SUM(total_amount)     AS total_amount
FROM v_shift_pay
GROUP BY 1, 2, 3;
