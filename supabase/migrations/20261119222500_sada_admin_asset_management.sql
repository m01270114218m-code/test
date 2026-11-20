-- Sada admin dashboard and visual asset registry.
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','super_admin','moderator')),
  created_at timestamptz not null default now()
);
create or replace function public.is_app_admin()
returns boolean language sql stable security definer
set search_path = pg_catalog, public, auth
as $$ select exists (select 1 from public.admin_roles ar where ar.user_id = (select auth.uid())); $$;
create or replace function public.is_app_super_admin()
returns boolean language sql stable security definer
set search_path = pg_catalog, public, auth
as $$ select exists (select 1 from public.admin_roles ar where ar.user_id = (select auth.uid()) and ar.role = 'super_admin'); $$;
revoke all on function public.is_app_admin() from public, anon, authenticated;
revoke all on function public.is_app_super_admin() from public, anon, authenticated;
grant execute on function public.is_app_admin() to authenticated;
grant execute on function public.is_app_super_admin() to authenticated;

create table if not exists public.app_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  title text not null,
  category text not null check (category in ('frame','gift','entrance','vip','avatar','room_background','banner','icon','page_element','sound','other')),
  storage_path text not null,
  mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_assets_category_active_order_idx on public.app_assets(category,is_active,sort_order);
create table if not exists public.app_settings (
  setting_key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);

alter table public.admin_roles enable row level security;
alter table public.app_assets enable row level security;
alter table public.app_settings enable row level security;
alter table public.admin_audit_logs enable row level security;
drop policy if exists admin_roles_read_self on public.admin_roles;
create policy admin_roles_read_self on public.admin_roles for select to authenticated using (user_id = (select auth.uid()) or public.is_app_super_admin());
drop policy if exists app_assets_public_read on public.app_assets;
create policy app_assets_public_read on public.app_assets for select to anon, authenticated using (is_active = true);
drop policy if exists app_assets_admin_manage on public.app_assets;
create policy app_assets_admin_manage on public.app_assets for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists app_settings_public_read on public.app_settings;
create policy app_settings_public_read on public.app_settings for select to anon, authenticated using (is_public = true);
drop policy if exists app_settings_admin_manage on public.app_settings;
create policy app_settings_admin_manage on public.app_settings for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists admin_audit_admin_read on public.admin_audit_logs;
create policy admin_audit_admin_read on public.admin_audit_logs for select to authenticated using (public.is_app_admin());
drop policy if exists admin_audit_admin_insert on public.admin_audit_logs;
create policy admin_audit_admin_insert on public.admin_audit_logs for insert to authenticated with check (public.is_app_admin() and actor_id = (select auth.uid()));

drop policy if exists gifts_admin_manage on public.gifts;
create policy gifts_admin_manage on public.gifts for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists vip_packages_admin_manage on public.vip_packages;
create policy vip_packages_admin_manage on public.vip_packages for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists profiles_admin_read_all on public.profiles;
create policy profiles_admin_read_all on public.profiles for select to authenticated using (public.is_app_admin());
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists reports_admin_read on public.user_reports;
create policy reports_admin_read on public.user_reports for select to authenticated using (public.is_app_admin());
drop policy if exists reports_admin_update on public.user_reports;
create policy reports_admin_update on public.user_reports for update to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists wallets_admin_read on public.wallets;
create policy wallets_admin_read on public.wallets for select to authenticated using (public.is_app_admin());
drop policy if exists wallet_transactions_admin_read on public.wallet_transactions;
create policy wallet_transactions_admin_read on public.wallet_transactions for select to authenticated using (public.is_app_admin());
drop policy if exists user_vips_admin_manage on public.user_vips;
create policy user_vips_admin_manage on public.user_vips for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists user_inventory_admin_read on public.user_inventory;
create policy user_inventory_admin_read on public.user_inventory for select to authenticated using (public.is_app_admin());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('sada-app-assets','sada-app-assets',true,52428800,array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','video/mp4','audio/mpeg','audio/ogg','audio/mp4'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists sada_assets_public_read on storage.objects;
create policy sada_assets_public_read on storage.objects for select to anon, authenticated using (bucket_id='sada-app-assets');
drop policy if exists sada_assets_admin_insert on storage.objects;
create policy sada_assets_admin_insert on storage.objects for insert to authenticated with check (bucket_id='sada-app-assets' and public.is_app_admin());
drop policy if exists sada_assets_admin_update on storage.objects;
create policy sada_assets_admin_update on storage.objects for update to authenticated using (bucket_id='sada-app-assets' and public.is_app_admin()) with check (bucket_id='sada-app-assets' and public.is_app_admin());
drop policy if exists sada_assets_admin_delete on storage.objects;
create policy sada_assets_admin_delete on storage.objects for delete to authenticated using (bucket_id='sada-app-assets' and public.is_app_admin());

create or replace function public.admin_adjust_wallet(p_user_id uuid,p_currency text,p_amount bigint,p_reason text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare v_balance bigint;
begin
  if not public.is_app_admin() then raise exception 'admin access required'; end if;
  if p_currency not in ('coins','diamonds') then raise exception 'unsupported currency'; end if;
  if p_amount is null or p_amount=0 then raise exception 'amount must not be zero'; end if;
  if length(trim(coalesce(p_reason,'')))<3 then raise exception 'reason is required'; end if;
  update public.wallets set coins=case when p_currency='coins' then coins+p_amount else coins end,
    diamonds=case when p_currency='diamonds' then diamonds+p_amount else diamonds end, updated_at=now()
  where user_id=p_user_id and (case when p_currency='coins' then coins+p_amount else diamonds+p_amount end)>=0
  returning case when p_currency='coins' then coins else diamonds end into v_balance;
  if not found then raise exception 'wallet not found or resulting balance would be negative'; end if;
  insert into public.wallet_transactions(user_id,transaction_type,amount,currency,reference_type,reference_id,metadata)
  values(p_user_id,'admin_adjustment',p_amount,p_currency,'admin',auth.uid()::text,jsonb_build_object('reason',p_reason));
  insert into public.admin_audit_logs(actor_id,action,entity_type,entity_id,details)
  values(auth.uid(),'wallet.adjust','wallet',p_user_id::text,jsonb_build_object('currency',p_currency,'amount',p_amount,'reason',p_reason));
  return jsonb_build_object('success',true,'balance',v_balance,'currency',p_currency);
end; $$;
revoke all on function public.admin_adjust_wallet(uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.admin_adjust_wallet(uuid,text,bigint,text) to authenticated;

create or replace function public.admin_set_user_status(p_user_id uuid,p_status text,p_reason text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,auth as $$
begin
  if not public.is_app_admin() then raise exception 'admin access required'; end if;
  if p_status not in ('active','suspended','banned') then raise exception 'invalid status'; end if;
  update public.profiles set account_status=p_status,updated_at=now() where id=p_user_id;
  if not found then raise exception 'user not found'; end if;
  insert into public.admin_audit_logs(actor_id,action,entity_type,entity_id,details)
  values(auth.uid(),'user.status','profile',p_user_id::text,jsonb_build_object('status',p_status,'reason',p_reason));
  return jsonb_build_object('success',true,'user_id',p_user_id,'status',p_status);
end; $$;
revoke all on function public.admin_set_user_status(uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_set_user_status(uuid,text,text) to authenticated;
