/*
DEV-006 verification
Validates:
1) Normalized category name uniqueness per user + kind.
2) category kind can change only when category has no transactions.
3) Required DEV-006 indexes/functions/triggers exist.
*/

begin;

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_categories_user_kind_name_normalized'
  ) then
    raise exception 'Missing unique index: idx_categories_user_kind_name_normalized';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_transactions_category_id'
  ) then
    raise exception 'Missing index: idx_transactions_category_id';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'prevent_category_kind_update_when_used'
      and tgrelid = 'public.categories'::regclass
      and not tgisinternal
  ) then
    raise exception 'Missing trigger: prevent_category_kind_update_when_used';
  end if;

  if not exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'find_category_duplicate_by_name'
  ) then
    raise exception 'Missing function: public.find_category_duplicate_by_name';
  end if;
end
$$;

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
values (
  '44444444-4444-4444-8444-444444444444',
  'authenticated',
  'authenticated',
  'dev006-user@example.com',
  'dev006-hash',
  timezone('utc', now()),
  timezone('utc', now()),
  timezone('utc', now()),
  '{}'::jsonb,
  '{}'::jsonb
)
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);

insert into public.profiles (id, name, email, base_currency)
values ('44444444-4444-4444-8444-444444444444', 'DEV006 User', 'dev006-user@example.com', 'PEN')
on conflict (id) do update
set name = excluded.name,
    email = excluded.email,
    base_currency = excluded.base_currency;

insert into public.categories (id, user_id, name, kind)
values (
  '55555555-5555-4555-8555-555555555551',
  '44444444-4444-4444-8444-444444444444',
  '  Alimentacion   Casa  ',
  'expense'
);

do $$
declare
  duplicate_id uuid;
  duplicate_name text;
begin
  select d.id, d.name
  into duplicate_id, duplicate_name
  from public.find_category_duplicate_by_name('expense', 'alimentacion casa', null) as d;

  if duplicate_id is distinct from '55555555-5555-4555-8555-555555555551'::uuid
    or duplicate_name is distinct from '  Alimentacion   Casa  ' then
    raise exception 'Expected duplicate lookup to return seeded category, got id=% name=%',
      duplicate_id,
      duplicate_name;
  end if;
end
$$;

do $$
declare
  duplicate_id uuid;
begin
  select d.id
  into duplicate_id
  from public.find_category_duplicate_by_name(
    'expense',
    'alimentacion casa',
    '55555555-5555-4555-8555-555555555551'::uuid
  ) as d;

  if duplicate_id is not null then
    raise exception 'Expected duplicate lookup to ignore excluded category id, got %', duplicate_id;
  end if;
end
$$;

do $$
begin
  begin
    insert into public.categories (id, user_id, name, kind)
    values (
      '55555555-5555-4555-8555-555555555552',
      '44444444-4444-4444-8444-444444444444',
      'alimentacion casa',
      'expense'
    );
    raise exception 'Expected duplicate category name violation';
  exception
    when others then
      if sqlstate = '23505' then
        null;
      else
        raise;
      end if;
  end;
end
$$;

insert into public.categories (id, user_id, name, kind)
values (
  '55555555-5555-4555-8555-555555555553',
  '44444444-4444-4444-8444-444444444444',
  'Ingreso base',
  'income'
);

insert into public.accounts (id, user_id, name, type, currency, archived)
values (
  '66666666-6666-4666-8666-666666666661',
  '44444444-4444-4444-8444-444444444444',
  'Wallet DEV006',
  'asset',
  'PEN',
  false
);

insert into public.transactions (id, user_id, account_id, category_id, amount, direction, currency, occurred_at, note)
values (
  '77777777-7777-4777-8777-777777777771',
  '44444444-4444-4444-8444-444444444444',
  '66666666-6666-4666-8666-666666666661',
  '55555555-5555-4555-8555-555555555551',
  15.00,
  'out',
  'PEN',
  timezone('utc', now()),
  'Used category'
);

do $$
begin
  begin
    update public.categories
    set kind = 'income'
    where id = '55555555-5555-4555-8555-555555555551';
    raise exception 'Expected used category kind update denial';
  exception
    when others then
      if sqlstate = '23514' then
        null;
      else
        raise;
      end if;
  end;
end
$$;

update public.categories
set kind = 'expense'
where id = '55555555-5555-4555-8555-555555555553';

rollback;
