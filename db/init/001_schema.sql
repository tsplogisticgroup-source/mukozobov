-- Смена · учёт выходов, выработки и затрат на персонал склада
-- Схема создаётся автоматически при первом старте контейнера postgres.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------- пользователи
-- role: admin — руководитель склада, senior — старший смены, picker — комплектовщик
-- status: pending — зарегистрировался, ждёт подтверждения; active — работает; blocked — уволен/заблокирован
CREATE TABLE employees (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  last_name     text NOT NULL,
  first_name    text NOT NULL,
  middle_name   text,
  birth_date    date,
  photo_path    text,
  role          text NOT NULL DEFAULT 'picker' CHECK (role IN ('admin','senior','picker')),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','blocked')),
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX employees_status_idx ON employees (status, role);

-- ---------------------------------------------------------------------- смены
-- kind: day — дневная, night — ночная. На одну дату не больше одной смены каждого вида.
CREATE TABLE shifts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_date   date NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('day','night')),
  need_picker int  NOT NULL DEFAULT 0,
  need_senior int  NOT NULL DEFAULT 0,
  note        text,
  closed      boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (work_date, kind)
);

CREATE INDEX shifts_date_idx ON shifts (work_date DESC);

-- ------------------------------------------------------------- записи на смену
-- status: requested — заявка, approved — подтверждён, rejected — отклонён,
--         cancelled — отменил сам, no_show — не вышел (не оплачивается)
CREATE TABLE shift_signups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id     uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  employee_id  uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'requested'
               CHECK (status IN ('requested','approved','rejected','cancelled','no_show')),
  decided_by   uuid REFERENCES employees(id),
  decided_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shift_id, employee_id)
);

CREATE INDEX signups_employee_idx ON shift_signups (employee_id);
CREATE INDEX signups_shift_idx    ON shift_signups (shift_id, status);

-- ------------------------------------------------------------------- выработка
-- work_type: FBO / FBS. unit — единица учёта (шт, короб, паллета, заказ).
CREATE TABLE outputs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_id   uuid NOT NULL REFERENCES shift_signups(id) ON DELETE CASCADE,
  work_type   text NOT NULL CHECK (work_type IN ('FBO','FBS')),
  unit        text NOT NULL,
  quantity    numeric(12,2) NOT NULL CHECK (quantity >= 0),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX outputs_signup_idx ON outputs (signup_id);

-- --------------------------------------------------------- ставки за смену
-- История ставок: берём запись с максимальным effective_from <= дате смены.
CREATE TABLE shift_rates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role           text NOT NULL CHECK (role IN ('admin','senior','picker')),
  kind           text NOT NULL CHECK (kind IN ('day','night')),
  amount         numeric(12,2) NOT NULL CHECK (amount >= 0),
  effective_from date NOT NULL DEFAULT current_date,
  UNIQUE (role, kind, effective_from)
);

-- --------------------------------------------------- сдельные расценки
CREATE TABLE piece_rates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_type      text NOT NULL CHECK (work_type IN ('FBO','FBS')),
  unit           text NOT NULL,
  amount         numeric(12,2) NOT NULL CHECK (amount >= 0),
  effective_from date NOT NULL DEFAULT current_date,
  UNIQUE (work_type, unit, effective_from)
);

-- ---------------------------------------- персональная надбавка к ставке
-- Необязательно: если у конкретного человека ставка выше типовой.
CREATE TABLE employee_rates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  kind           text NOT NULL CHECK (kind IN ('day','night')),
  amount         numeric(12,2) NOT NULL CHECK (amount >= 0),
  effective_from date NOT NULL DEFAULT current_date,
  UNIQUE (employee_id, kind, effective_from)
);
