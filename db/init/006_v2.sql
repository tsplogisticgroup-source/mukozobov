-- Вторая версия: собственники, почасовая оплата, план/факт по маркетплейсам,
-- отгрузки. Файл применяется повторно без вреда.

-- ------------------------------------------------------------ роли
-- owner — собственник: полный доступ, в том числе к деньгам.
-- admin — руководитель склада: смены, люди, план, часы; денег не видит.
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check;
ALTER TABLE employees ADD CONSTRAINT employees_role_check
  CHECK (role IN ('owner','admin','senior','picker'));

ALTER TABLE shift_rates DROP CONSTRAINT IF EXISTS shift_rates_role_check;
ALTER TABLE shift_rates ADD CONSTRAINT shift_rates_role_check
  CHECK (role IN ('owner','admin','senior','picker'));

-- Все, кто был руководителем до этой версии, становятся собственниками:
-- руководителя склада собственник назначит сам.
UPDATE employees SET role = 'owner' WHERE role = 'admin';

-- ------------------------------------------------------------ часы
-- Оплата почасовая: у каждого выхода — сколько часов отработано.
ALTER TABLE shift_signups ADD COLUMN IF NOT EXISTS hours numeric(4,1) NOT NULL DEFAULT 12
  CHECK (hours >= 0 AND hours <= 24);

-- Ставка теперь означает рубли за час. Старые суммы «за смену» переписываем.
UPDATE shift_rates SET amount = 500 WHERE role IN ('picker','senior');
UPDATE shift_rates SET amount = 0   WHERE role = 'admin';
INSERT INTO shift_rates (role, kind, amount, effective_from)
SELECT 'owner', k, 0, '2020-01-01' FROM unnest(ARRAY['day','night']) k
ON CONFLICT (role, kind, effective_from) DO NOTHING;

-- ------------------------------------------------------------ единицы учёта
-- Что считаем в плане и выработке. Сдельных расценок больше нет —
-- справочник единиц живёт отдельно от денег.
CREATE TABLE IF NOT EXISTS volume_units (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_type text NOT NULL CHECK (work_type IN ('FBO','FBS')),
  unit      text NOT NULL,
  sort      int  NOT NULL DEFAULT 0,
  UNIQUE (work_type, unit)
);

INSERT INTO volume_units (work_type, unit, sort) VALUES
  ('FBO', 'пара',    1), ('FBO', 'короб', 2), ('FBO', 'паллета', 3),
  ('FBS', 'заказ',   1), ('FBS', 'пара',  2), ('FBS', 'короб',   3)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------ план и факт
-- Одна таблица на обе цифры: kind = plan (задание на смену) или fact (сделано).
-- Разрез — маркетплейс × вид работ × единица.
CREATE TABLE IF NOT EXISTS shift_volumes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id    uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('plan','fact')),
  marketplace text NOT NULL CHECK (marketplace IN ('wb','ozon')),
  work_type   text NOT NULL CHECK (work_type IN ('FBO','FBS')),
  unit        text NOT NULL,
  quantity    numeric(12,2) NOT NULL CHECK (quantity >= 0),
  updated_by  uuid REFERENCES employees(id),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shift_id, kind, marketplace, work_type, unit)
);

CREATE INDEX IF NOT EXISTS shift_volumes_shift_idx ON shift_volumes (shift_id, kind);

-- ------------------------------------------------------------ отгрузки
CREATE TABLE IF NOT EXISTS drivers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text,
  vehicle    text,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id    uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  driver_id   uuid REFERENCES drivers(id) ON DELETE SET NULL,
  marketplace text NOT NULL CHECK (marketplace IN ('wb','ozon')),
  destination text NOT NULL,
  pallets     int  NOT NULL DEFAULT 0 CHECK (pallets >= 0),
  boxes       int  NOT NULL DEFAULT 0 CHECK (boxes >= 0),
  comment     text,
  created_by  uuid REFERENCES employees(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipments_shift_idx ON shipments (shift_id);

-- ------------------------------------------------------------ расчёт оплаты
-- Оплата выхода = часы × ставка за час (личная, если задана, иначе по должности).
-- Колонки оставлены в прежнем порядке: от представления зависит лицевой счёт.
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
  ROUND(su.hours * COALESCE(pers.amount, base.amount, 0), 2) AS shift_amount,
  0::numeric                                                  AS piece_amount,
  ROUND(su.hours * COALESCE(pers.amount, base.amount, 0), 2) AS total_amount,
  s.closed                                                    AS shift_closed,
  su.hours,
  COALESCE(pers.amount, base.amount, 0)                       AS hourly_rate
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
WHERE su.status = 'approved';
