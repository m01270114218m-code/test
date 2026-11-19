-- Sada live catalogs, room moderation, and transactional asset/VIP store.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role, account_status, setup_step, setup_complete)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name',''), ''), 'user', 'active', 'profile', false)
  on conflict (id) do nothing;
  insert into public.wallets (user_id, coins, diamonds)
  values (new.id, 0, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

insert into public.wallets(user_id,coins,diamonds)
select p.id,0,0 from public.profiles p
left join public.wallets w on w.user_id=p.id
where w.user_id is null;

drop policy if exists rooms_admin_manage on public.rooms;
create policy rooms_admin_manage on public.rooms for all to authenticated
using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists room_seats_admin_manage on public.room_seats;
create policy room_seats_admin_manage on public.room_seats for all to authenticated
using (public.is_app_admin()) with check (public.is_app_admin());

create or replace function private.purchase_vip_internal(p_package_id uuid)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_package public.vip_packages%rowtype;
  v_balance bigint;
  v_expires timestamptz;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_package from public.vip_packages where id=p_package_id and is_active=true for update;
  if not found then raise exception 'VIP package not found or inactive'; end if;
  if v_package.currency not in ('coins','diamonds') then raise exception 'unsupported currency'; end if;
  update public.wallets
  set coins=case when v_package.currency='coins' then coins-v_package.price else coins end,
      diamonds=case when v_package.currency='diamonds' then diamonds-v_package.price else diamonds end,
      updated_at=now()
  where user_id=v_uid
    and (case when v_package.currency='coins' then coins>=v_package.price else diamonds>=v_package.price end)
  returning case when v_package.currency='coins' then coins else diamonds end into v_balance;
  if not found then raise exception 'insufficient wallet balance'; end if;
  insert into public.wallet_transactions(user_id,transaction_type,amount,currency,reference_type,reference_id,metadata)
  values(v_uid,'vip_purchase',-v_package.price,v_package.currency,'vip_package',v_package.id::text,jsonb_build_object('package_name',v_package.name));
  insert into public.user_vips(user_id,package_id,starts_at,expires_at)
  values(v_uid,v_package.id,now(),now()+make_interval(days=>v_package.duration_days))
  on conflict(user_id) do update
    set package_id=excluded.package_id, starts_at=now(),
        expires_at=greatest(public.user_vips.expires_at,now())+make_interval(days=>v_package.duration_days);
  select expires_at into v_expires from public.user_vips where user_id=v_uid;
  return jsonb_build_object('success',true,'package_id',v_package.id,'balance',v_balance,'currency',v_package.currency,'expires_at',v_expires);
end;
$$;

create or replace function private.purchase_asset_internal(p_asset_key text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_asset public.app_assets%rowtype;
  v_price bigint;
  v_currency text;
  v_balance bigint;
  v_inventory_id uuid;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_asset from public.app_assets where asset_key=p_asset_key and is_active=true for update;
  if not found then raise exception 'asset not found or inactive'; end if;
  v_price := coalesce((v_asset.metadata->>'price')::bigint,0);
  v_currency := coalesce(v_asset.metadata->>'currency','coins');
  if v_price<=0 then raise exception 'asset is not for sale'; end if;
  if v_currency not in ('coins','diamonds') then raise exception 'unsupported currency'; end if;
  update public.wallets
  set coins=case when v_currency='coins' then coins-v_price else coins end,
      diamonds=case when v_currency='diamonds' then diamonds-v_price else diamonds end,
      updated_at=now()
  where user_id=v_uid and (case when v_currency='coins' then coins>=v_price else diamonds>=v_price end)
  returning case when v_currency='coins' then coins else diamonds end into v_balance;
  if not found then raise exception 'insufficient wallet balance'; end if;
  select id into v_inventory_id from public.user_inventory
  where user_id=v_uid and item_type=v_asset.category and item_id=v_asset.asset_key
    and (expires_at is null or expires_at>now()) limit 1 for update;
  if v_inventory_id is null then
    insert into public.user_inventory(user_id,item_type,item_id,quantity,metadata)
    values(v_uid,v_asset.category,v_asset.asset_key,1,jsonb_build_object('title',v_asset.title));
  else
    update public.user_inventory set quantity=quantity+1 where id=v_inventory_id;
  end if;
  insert into public.wallet_transactions(user_id,transaction_type,amount,currency,reference_type,reference_id,metadata)
  values(v_uid,'asset_purchase',-v_price,v_currency,'app_asset',v_asset.asset_key,jsonb_build_object('title',v_asset.title,'category',v_asset.category));
  return jsonb_build_object('success',true,'asset_key',v_asset.asset_key,'balance',v_balance,'currency',v_currency);
end;
$$;

create or replace function private.equip_asset_internal(p_asset_key text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_asset public.app_assets%rowtype;
  v_meta_key text;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_asset from public.app_assets where asset_key=p_asset_key and is_active=true;
  if not found then raise exception 'asset not found or inactive'; end if;
  if not exists(select 1 from public.user_inventory where user_id=v_uid and item_type=v_asset.category and item_id=v_asset.asset_key and (expires_at is null or expires_at>now())) then
    raise exception 'asset is not in your inventory';
  end if;
  v_meta_key := case v_asset.category
    when 'frame' then 'equipped_frame'
    when 'entrance' then 'equipped_entrance'
    when 'page_element' then 'equipped_page_element'
    when 'room_background' then 'equipped_room_background'
    else 'equipped_' || v_asset.category
  end;
  update public.profiles
  set metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),array[v_meta_key],to_jsonb(p_asset_key),true),updated_at=now()
  where id=v_uid;
  return jsonb_build_object('success',true,'asset_key',p_asset_key,'category',v_asset.category);
end;
$$;

grant usage on schema private to authenticated;
grant execute on function private.purchase_vip_internal(uuid) to authenticated;
grant execute on function private.purchase_asset_internal(text) to authenticated;
grant execute on function private.equip_asset_internal(text) to authenticated;

create or replace function public.purchase_vip(p_package_id uuid)
returns jsonb language sql set search_path=public,private
as $$ select private.purchase_vip_internal(p_package_id); $$;
create or replace function public.purchase_asset(p_asset_key text)
returns jsonb language sql set search_path=public,private
as $$ select private.purchase_asset_internal(p_asset_key); $$;
create or replace function public.equip_asset(p_asset_key text)
returns jsonb language sql set search_path=public,private
as $$ select private.equip_asset_internal(p_asset_key); $$;
revoke all on function public.purchase_vip(uuid) from public,anon,authenticated;
revoke all on function public.purchase_asset(text) from public,anon,authenticated;
revoke all on function public.equip_asset(text) from public,anon,authenticated;
grant execute on function public.purchase_vip(uuid) to authenticated;
grant execute on function public.purchase_asset(text) to authenticated;
grant execute on function public.equip_asset(text) to authenticated;

alter table public.rooms replica identity full;
alter table public.gifts replica identity full;
alter table public.vip_packages replica identity full;
alter table public.app_assets replica identity full;
do $$
begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='rooms') then alter publication supabase_realtime add table public.rooms; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='gifts') then alter publication supabase_realtime add table public.gifts; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='vip_packages') then alter publication supabase_realtime add table public.vip_packages; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='app_assets') then alter publication supabase_realtime add table public.app_assets; end if;
end $$;

update storage.buckets set file_size_limit=104857600,
allowed_mime_types=array[
'image/png','image/jpeg','image/webp','image/avif','image/gif','image/apng','image/svg+xml',
'video/mp4','video/webm','video/quicktime','video/x-m4v',
'audio/mpeg','audio/mp4','audio/aac','audio/ogg','audio/wav','audio/webm',
'application/json','model/gltf+json','model/gltf-binary','application/octet-stream'
] where id='sada-app-assets';
