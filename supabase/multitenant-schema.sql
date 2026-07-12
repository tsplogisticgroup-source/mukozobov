-- ============================================================================
--  МУЛЬТИТЕНАНТ-СХЕМА для единой WMS (много клиентов, один код)
--  Выполнить в НОВОМ Supabase-проекте: Dashboard → SQL Editor → New query → Run.
--
--  Модель доступа:
--    • Организация (org) = один клиент (WB-продавец).
--    • Пользователь-клиент видит только свою организацию.
--    • Платформенный оператор (ты) видит все организации и переключается между ними.
--  Данные клиентов физически изолированы политиками RLS по org_id.
-- ============================================================================

-- ── Организации (клиенты) ───────────────────────────────────────────────────
create table if not exists public.orgs (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  -- Брендинг white-label (название, цвета, логотип) — заполняется позже.
  brand      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── Членство: кто в какой организации и с какой ролью ────────────────────────
--  role: 'client' — обычный пользователь клиента (внутри своей организации).
create table if not exists public.memberships (
  user_id    uuid not null references auth.users(id) on delete cascade,
  org_id     uuid not null references public.orgs(id) on delete cascade,
  role       text not null default 'client',
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);
create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists memberships_org_idx  on public.memberships(org_id);

-- ── Платформенные операторы (ты) — видят и ведут все организации ─────────────
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── KV-хранилище приложения, разбитое по организации ────────────────────────
--  Тот же формат, что в текущей sklad_kv, но с колонкой org_id и составным ключом.
create table if not exists public.sklad_kv (
  org_id     uuid not null references public.orgs(id) on delete cascade,
  key        text not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (org_id, key)
);

-- ── Секреты организации (WB-токен и т.п.) ────────────────────────────────────
--  RLS включён, политик НЕТ → из браузера (anon/authenticated) недоступно.
--  Читает только Cloudflare Worker через service_role (обходит RLS).
create table if not exists public.org_secrets (
  org_id     uuid primary key references public.orgs(id) on delete cascade,
  wb_token   text,
  updated_at timestamptz not null default now()
);

-- ── Помощники (SECURITY DEFINER → обходят RLS, чтобы не было рекурсии) ───────
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

create or replace function public.is_org_member(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where user_id = auth.uid() and org_id = target);
$$;

-- ── Включаем RLS ─────────────────────────────────────────────────────────────
alter table public.orgs            enable row level security;
alter table public.memberships     enable row level security;
alter table public.platform_admins enable row level security;
alter table public.sklad_kv        enable row level security;
alter table public.org_secrets     enable row level security;

-- ── Политики: данные приложения ─────────────────────────────────────────────
drop policy if exists kv_select on public.sklad_kv;
create policy kv_select on public.sklad_kv for select
  using (public.is_platform_admin() or public.is_org_member(org_id));

drop policy if exists kv_write on public.sklad_kv;
create policy kv_write on public.sklad_kv for all
  using       (public.is_platform_admin() or public.is_org_member(org_id))
  with check  (public.is_platform_admin() or public.is_org_member(org_id));

-- ── Политики: организации ────────────────────────────────────────────────────
drop policy if exists orgs_select on public.orgs;
create policy orgs_select on public.orgs for select
  using (public.is_platform_admin() or public.is_org_member(id));

drop policy if exists orgs_admin on public.orgs;
create policy orgs_admin on public.orgs for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ── Политики: членство ───────────────────────────────────────────────────────
drop policy if exists mem_select on public.memberships;
create policy mem_select on public.memberships for select
  using (public.is_platform_admin() or user_id = auth.uid());

drop policy if exists mem_admin on public.memberships;
create policy mem_admin on public.memberships for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ── Политики: платформенные админы (каждый видит только себя) ────────────────
drop policy if exists pa_self on public.platform_admins;
create policy pa_self on public.platform_admins for select using (user_id = auth.uid());
-- Управление списком админов — только через service_role (SQL Editor / бэкенд).

-- org_secrets: политик нет намеренно → доступ только у service_role.

-- ============================================================================
--  ПОСЛЕ ВЫПОЛНЕНИЯ:
--  1. Создай себе пользователя (Authentication → Users → Add user), если ещё нет.
--  2. Сделай себя платформенным оператором — подставь свой email:
--       insert into public.platform_admins (user_id)
--       select id from auth.users where email = 'ТВОЙ_EMAIL';
--  3. Заведи первую организацию (текущий клиент):
--       insert into public.orgs (name) values ('Носим сутками') returning id;
--     (id понадобится для миграции данных с текущего склада.)
-- ============================================================================
