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
insert into raffle_settings (campaign_name,start_date,end_date,raffle_date,status) values ('Tu peludito te puede llevar al concierto de BTS','2026-07-01','2026-08-13','2026-08-13','active') on conflict do nothing;
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
