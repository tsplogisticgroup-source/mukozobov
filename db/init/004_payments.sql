-- Выплаты и штрафы. Ведём лицевой счёт сотрудника:
--   начислено за смены − штрафы − выплачено = остаток к выплате.
-- Выплата не привязана к конкретной смене: на складе платят «за период»,
-- а не за каждый выход по отдельности.

CREATE TABLE IF NOT EXISTS payments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount      numeric(12,2) NOT NULL CHECK (amount > 0),
  paid_on     date NOT NULL DEFAULT current_date,
  method      text NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','card','account')),
  comment     text,
  created_by  uuid REFERENCES employees(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_employee_idx ON payments (employee_id, paid_on DESC);

CREATE TABLE IF NOT EXISTS penalties (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount      numeric(12,2) NOT NULL CHECK (amount > 0),
  reason      text NOT NULL,
  penalty_on  date NOT NULL DEFAULT current_date,
  -- необязательная привязка к смене: штраф за конкретный выход
  signup_id   uuid REFERENCES shift_signups(id) ON DELETE SET NULL,
  created_by  uuid REFERENCES employees(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS penalties_employee_idx ON penalties (employee_id, penalty_on DESC);

-- Лицевой счёт: сколько человек заработал за всё время, сколько удержано,
-- сколько получил и сколько за ним осталось.
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
  COALESCE(w.earned, 0) - COALESCE(f.penalty, 0) - COALESCE(p.paid, 0) AS balance
FROM employees e
LEFT JOIN LATERAL (
  SELECT SUM(total_amount) AS earned, COUNT(*) AS shifts_count
  FROM v_shift_pay v WHERE v.employee_id = e.id
) w ON true
LEFT JOIN LATERAL (
  SELECT SUM(amount) AS penalty FROM penalties WHERE employee_id = e.id
) f ON true
LEFT JOIN LATERAL (
  SELECT SUM(amount) AS paid FROM payments WHERE employee_id = e.id
) p ON true;
