create extension if not exists pgcrypto;
create table if not exists participants (id uuid primary key default gen_random_uuid(), full_name text not null, phone text not null, email text, instagram text, created_at timestamptz default now(), updated_at timestamptz default now());
create unique index if not exists participants_phone_unique on participants (phone);
create table if not exists pets (id uuid primary key default gen_random_uuid(), participant_id uuid references participants(id) on delete cascade, name text not null, species text, breed text, created_at timestamptz default now());
create table if not exists transactions (id uuid primary key default gen_random_uuid(), participant_id uuid references participants(id) on delete cascade, pet_id uuid references pets(id), transaction_date date not null, type text not null, amount integer not null, receipt_number text, coupons_generated integer not null default 0, notes text, created_by uuid, created_at timestamptz default now());
create table if not exists bonus (id uuid primary key default gen_random_uuid(), participant_id uuid references participants(id) on delete cascade, bonus_type text not null, description text, coupons_generated integer not null default 0, related_participant_id uuid references participants(id), verified boolean default true, created_by uuid, created_at timestamptz default now());
create sequence if not exists bts_coupon_seq start 1;
create table if not exists coupons (id uuid primary key default gen_random_uuid(), code text unique not null default ('BTS-' || lpad(nextval('bts_coupon_seq')::text, 6, '0')), participant_id uuid references participants(id) on delete cascade, source_type text not null, source_id uuid not null, status text not null default 'valid' check (status in ('valid','void','winner')), created_at timestamptz default now());
create table if not exists raffle_settings (id uuid primary key default gen_random_uuid(), campaign_name text not null, start_date date, end_date date, raffle_date date, amount_per_coupon integer not null default 5000, instagram_bonus_coupons integer not null default 1, referral_bonus_coupons integer not null default 2, status text not null default 'active', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists raffle_results (id uuid primary key default gen_random_uuid(), raffle_settings_id uuid references raffle_settings(id), winning_coupon_id uuid references coupons(id), winner_participant_id uuid references participants(id), total_valid_coupons integer, raffle_datetime timestamptz default now(), method text, notes text, created_by uuid, created_at timestamptz default now());
insert into raffle_settings (campaign_name,start_date,end_date,raffle_date,status) values ('Tu peludito te puede llevar al concierto de BTS','2026-07-01','2026-09-10','2026-09-10','active') on conflict do nothing;
create or replace function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists participants_touch_updated_at on participants;
create trigger participants_touch_updated_at before update on participants for each row execute function touch_updated_at();
drop trigger if exists raffle_settings_touch_updated_at on raffle_settings;
create trigger raffle_settings_touch_updated_at before update on raffle_settings for each row execute function touch_updated_at();
create or replace function generate_bts_coupons(p_participant_id uuid, p_source_type text, p_source_id uuid, p_count integer) returns setof coupons language plpgsql security definer as $$
declare i integer;
begin
  if p_count is null or p_count < 1 then return; end if;
  for i in 1..p_count loop
    return query insert into coupons (participant_id, source_type, source_id) values (p_participant_id, p_source_type, p_source_id) returning *;
  end loop;
end; $$;
alter table participants enable row level security; alter table pets enable row level security; alter table transactions enable row level security; alter table bonus enable row level security; alter table coupons enable row level security; alter table raffle_settings enable row level security; alter table raffle_results enable row level security;
create policy "public lookup participants" on participants for select using (true);
create policy "public lookup pets" on pets for select using (true);
create policy "public lookup coupons" on coupons for select using (true);
create policy "authenticated manage participants" on participants for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "authenticated manage pets" on pets for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "authenticated manage transactions" on transactions for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "authenticated manage bonus" on bonus for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "authenticated manage coupons" on coupons for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "authenticated manage settings" on raffle_settings for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "authenticated manage results" on raffle_results for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Admin access control for /admin-bts
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text default 'admin',
  active boolean default true,
  created_at timestamptz default now()
);
create unique index if not exists admin_users_user_id_unique on admin_users (user_id);
create unique index if not exists admin_users_email_unique on admin_users (lower(email));
alter table admin_users enable row level security;

create or replace function is_bts_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from admin_users au
    where au.user_id = p_user_id
      and au.active = true
  );
$$;

drop policy if exists "admin users can read own access" on admin_users;
create policy "admin users can read own access" on admin_users
  for select using (auth.uid() = user_id);

-- Replace broad authenticated/public policies with admin-only mutations and full admin reads.
drop policy if exists "public lookup participants" on participants;
drop policy if exists "public lookup pets" on pets;
drop policy if exists "public lookup coupons" on coupons;
drop policy if exists "authenticated manage participants" on participants;
drop policy if exists "authenticated manage pets" on pets;
drop policy if exists "authenticated manage transactions" on transactions;
drop policy if exists "authenticated manage bonus" on bonus;
drop policy if exists "authenticated manage coupons" on coupons;
drop policy if exists "authenticated manage settings" on raffle_settings;
drop policy if exists "authenticated manage results" on raffle_results;

drop policy if exists "admins manage participants" on participants;
create policy "admins manage participants" on participants for all
  using (is_bts_admin()) with check (is_bts_admin());
drop policy if exists "admins manage pets" on pets;
create policy "admins manage pets" on pets for all
  using (is_bts_admin()) with check (is_bts_admin());
drop policy if exists "admins manage transactions" on transactions;
create policy "admins manage transactions" on transactions for all
  using (is_bts_admin()) with check (is_bts_admin());
drop policy if exists "admins manage bonus" on bonus;
create policy "admins manage bonus" on bonus for all
  using (is_bts_admin()) with check (is_bts_admin());
drop policy if exists "admins manage coupons" on coupons;
create policy "admins manage coupons" on coupons for all
  using (is_bts_admin()) with check (is_bts_admin());
drop policy if exists "admins manage settings" on raffle_settings;
create policy "admins manage settings" on raffle_settings for all
  using (is_bts_admin()) with check (is_bts_admin());
drop policy if exists "admins manage results" on raffle_results;
create policy "admins manage results" on raffle_results for all
  using (is_bts_admin()) with check (is_bts_admin());

create or replace function mask_bts_tutor_name(p_name text)
returns text
language sql
immutable
as $$
  select case
    when coalesce(trim(p_name), '') = '' then ''
    when length(split_part(trim(p_name), ' ', 1)) <= 2 then split_part(trim(p_name), ' ', 1) || '***'
    else left(split_part(trim(p_name), ' ', 1), 2) || repeat('*', greatest(length(split_part(trim(p_name), ' ', 1)) - 2, 1))
  end;
$$;

create or replace function lookup_bts_coupons_public(p_phone text)
returns table(tutor_name text, pet_name text, total_coupons bigint, coupon_codes text[])
language sql
stable
security definer
set search_path = public
as $$
  with matched_participant as (
    select p.id, p.full_name
    from participants p
    where p.phone = regexp_replace(coalesce(p_phone, ''), '\\D', '', 'g')
       or p.phone = coalesce(p_phone, '')
    order by p.created_at desc
    limit 1
  ), valid_coupons as (
    select c.code
    from coupons c
    join matched_participant mp on mp.id = c.participant_id
    where c.status = 'valid'
    order by c.code
  )
  select
    mask_bts_tutor_name(mp.full_name) as tutor_name,
    (select pe.name from pets pe where pe.participant_id = mp.id order by pe.created_at asc limit 1) as pet_name,
    (select count(*) from valid_coupons) as total_coupons,
    coalesce((select array_agg(code order by code) from valid_coupons), array[]::text[]) as coupon_codes
  from matched_participant mp;
$$;

grant execute on function lookup_bts_coupons_public(text) to anon, authenticated;
grant execute on function is_bts_admin(uuid) to authenticated;

create or replace function generate_bts_coupons(p_participant_id uuid, p_source_type text, p_source_id uuid, p_count integer)
returns setof coupons
language plpgsql
security definer
set search_path = public
as $$
declare i integer;
begin
  if not is_bts_admin(auth.uid()) then
    raise exception 'No tienes permisos para generar cupones.';
  end if;
  if p_count is null or p_count < 1 then return; end if;
  for i in 1..p_count loop
    return query insert into coupons (participant_id, source_type, source_id) values (p_participant_id, p_source_type, p_source_id) returning *;
  end loop;
end; $$;
