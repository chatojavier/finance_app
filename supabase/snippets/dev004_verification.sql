/*
DEV-004 verification script
Run after: supabase db reset
Command example:
  psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/snippets/dev004_verification.sql
*/

-- 1) Required tables exist
do $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    raise exception 'Missing table: public.profiles';
  end if;
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'currencies') then
    raise exception 'Missing table: public.currencies';
  end if;
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'accounts') then
    raise exception 'Missing table: public.accounts';
  end if;
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'categories') then
    raise exception 'Missing table: public.categories';
  end if;
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'transactions') then
    raise exception 'Missing table: public.transactions';
  end if;
end
$$;

-- 2) No editable balance column on accounts
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'accounts'
      and column_name = 'balance'
  ) then
    raise exception 'public.accounts must not contain a balance column';
  end if;
end
$$;

-- 3) profiles.base_currency is NOT NULL
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'base_currency'
      and is_nullable = 'YES'
  ) then
    raise exception 'profiles.base_currency must be NOT NULL';
  end if;
end
$$;

-- 4) Expected indexes
do $$
begin
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_accounts_user_id') then
    raise exception 'Missing index: idx_accounts_user_id';
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_categories_user_id') then
    raise exception 'Missing index: idx_categories_user_id';
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_transactions_user_id') then
    raise exception 'Missing index: idx_transactions_user_id';
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_transactions_account_id') then
    raise exception 'Missing index: idx_transactions_account_id';
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_transactions_occurred_at') then
    raise exception 'Missing index: idx_transactions_occurred_at';
  end if;
end
$$;

-- 5) Seed check for currencies
do $$
declare
  seeded_codes text[];
begin
  select array_agg(code order by code)
  into seeded_codes
  from public.currencies;

  if seeded_codes is distinct from array['BTC', 'EUR', 'PEN', 'USD'] then
    raise exception 'Unexpected currencies seed. Got: %', seeded_codes;
  end if;
end
$$;

-- 6) RLS enabled on protected tables
do $$
begin
  if not exists (select 1 from pg_class where relnamespace = 'public'::regnamespace and relname = 'profiles' and relrowsecurity) then
    raise exception 'RLS is not enabled on public.profiles';
  end if;
  if not exists (select 1 from pg_class where relnamespace = 'public'::regnamespace and relname = 'accounts' and relrowsecurity) then
    raise exception 'RLS is not enabled on public.accounts';
  end if;
  if not exists (select 1 from pg_class where relnamespace = 'public'::regnamespace and relname = 'categories' and relrowsecurity) then
    raise exception 'RLS is not enabled on public.categories';
  end if;
  if not exists (select 1 from pg_class where relnamespace = 'public'::regnamespace and relname = 'transactions' and relrowsecurity) then
    raise exception 'RLS is not enabled on public.transactions';
  end if;
end
$$;

-- 7) CRUD policies exist for ownership tables
do $$
declare
  expected_count integer;
begin
  select count(*)
  into expected_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'profiles'
    and policyname in (
      'profiles_select_own',
      'profiles_insert_own',
      'profiles_update_own',
      'profiles_delete_own'
    );

  if expected_count <> 4 then
    raise exception 'Missing ownership policies on public.profiles';
  end if;

  select count(*)
  into expected_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'accounts'
    and policyname in (
      'accounts_select_own',
      'accounts_insert_own',
      'accounts_update_own'
    );

  if expected_count <> 3 then
    raise exception 'Missing ownership policies on public.accounts';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
      and policyname = 'accounts_delete_own'
  ) then
    raise exception 'accounts_delete_own policy must not exist';
  end if;

  select count(*)
  into expected_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'categories'
    and policyname in (
      'categories_select_own',
      'categories_insert_own',
      'categories_update_own',
      'categories_delete_own'
    );

  if expected_count <> 4 then
    raise exception 'Missing ownership policies on public.categories';
  end if;

  select count(*)
  into expected_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'transactions'
    and policyname in (
      'transactions_select_own',
      'transactions_insert_own',
      'transactions_update_own',
      'transactions_delete_own'
    );

  if expected_count <> 4 then
    raise exception 'Missing ownership policies on public.transactions';
  end if;
end
$$;

-- 8) Automated cross-user checks (RLS + ownership trigger)
begin;

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
values
  (
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'dev004-user-a@example.com',
    'test-hash-a',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'dev004-user-b@example.com',
    'test-hash-b',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{}'::jsonb,
    '{}'::jsonb
  );

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);

-- User A setup
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

insert into public.profiles (id, name, email, base_currency)
values ('11111111-1111-1111-1111-111111111111', 'User A', 'dev004-user-a@example.com', 'PEN');

do $$
begin
  begin
    insert into public.profiles (id, name, email, base_currency)
    values ('22222222-2222-2222-2222-222222222222', 'User B', 'dev004-user-b@example.com', 'USD');
    raise exception 'Expected RLS denial when user A inserts profile for user B';
  exception
    when others then
      if sqlstate = '42501' or position('row-level security' in lower(sqlerrm)) > 0 then
        null;
      else
        raise;
      end if;
  end;
end
$$;

insert into public.accounts (id, user_id, name, type, currency)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Wallet A', 'asset', 'PEN');

insert into public.categories (id, user_id, name, kind)
values ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', 'Salary A', 'income');

insert into public.transactions (id, user_id, account_id, category_id, amount, direction, currency, occurred_at, note)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
  100.00,
  'in',
  'PEN',
  timezone('utc', now()),
  'Seed transaction A'
);

-- User B setup
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

insert into public.profiles (id, name, email, base_currency)
values ('22222222-2222-2222-2222-222222222222', 'User B', 'dev004-user-b@example.com', 'USD');

insert into public.accounts (id, user_id, name, type, currency)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'Wallet B', 'asset', 'USD');

insert into public.categories (id, user_id, name, kind)
values ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', '22222222-2222-2222-2222-222222222222', 'Salary B', 'income');

insert into public.transactions (id, user_id, account_id, category_id, amount, direction, currency, occurred_at, note)
values (
  'ffffffff-ffff-4fff-8fff-fffffffffff2',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
  200.00,
  'in',
  'USD',
  timezone('utc', now()),
  'Seed transaction B'
);

-- User A can only read own data
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

do $$
declare
  visible_profiles integer;
  visible_accounts integer;
  visible_categories integer;
  visible_transactions integer;
begin
  select count(*) into visible_profiles from public.profiles;
  select count(*) into visible_accounts from public.accounts;
  select count(*) into visible_categories from public.categories;
  select count(*) into visible_transactions from public.transactions;

  if visible_profiles <> 1 then
    raise exception 'User A should only see 1 profile, got %', visible_profiles;
  end if;
  if visible_accounts <> 1 then
    raise exception 'User A should only see 1 account, got %', visible_accounts;
  end if;
  if visible_categories <> 1 then
    raise exception 'User A should only see 1 category, got %', visible_categories;
  end if;
  if visible_transactions <> 1 then
    raise exception 'User A should only see 1 transaction, got %', visible_transactions;
  end if;
end
$$;

do $$
declare
  affected_rows integer;
begin
  update public.accounts
  set name = 'Attempted takeover'
  where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'User A should not update user B account';
  end if;

  delete from public.categories
  where id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd2';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'User A should not delete user B category';
  end if;

  delete from public.accounts
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'User A should not hard-delete own account';
  end if;
end
$$;

do $$
begin
  begin
    insert into public.accounts (user_id, name, type, currency)
    values ('22222222-2222-2222-2222-222222222222', 'Unauthorized account', 'asset', 'USD');
    raise exception 'Expected RLS denial when user A inserts account for user B';
  exception
    when others then
      if sqlstate = '42501' or position('row-level security' in lower(sqlerrm)) > 0 then
        null;
      else
        raise;
      end if;
  end;
end
$$;

do $$
begin
  begin
    insert into public.transactions (user_id, account_id, category_id, amount, direction, currency, occurred_at)
    values (
      '22222222-2222-2222-2222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
      10.00,
      'out',
      'USD',
      timezone('utc', now())
    );
    raise exception 'Expected uniform denial for spoofed transaction user_id';
  exception
    when others then
      if sqlstate = '42501' then
        null;
      else
        raise;
      end if;
  end;
end
$$;

do $$
begin
  begin
    insert into public.transactions (user_id, account_id, category_id, amount, direction, currency, occurred_at)
    values (
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
      10.00,
      'out',
      'USD',
      timezone('utc', now())
    );
    raise exception 'Expected check violation for account/transaction currency mismatch';
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

do $$
begin
  begin
    insert into public.transactions (user_id, account_id, category_id, amount, direction, currency, occurred_at)
    values (
      '11111111-1111-1111-1111-111111111111',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
      'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
      10.00,
      'out',
      'USD',
      timezone('utc', now())
    );
    raise exception 'Expected ownership trigger denial for cross-user account_id';
  exception
    when others then
      if sqlstate = '42501' then
        null;
      else
        raise;
      end if;
  end;
end
$$;

do $$
begin
  begin
    insert into public.transactions (user_id, account_id, category_id, amount, direction, currency, occurred_at)
    values (
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
      10.00,
      'out',
      'PEN',
      timezone('utc', now())
    );
    raise exception 'Expected ownership trigger denial for cross-user category_id';
  exception
    when others then
      if sqlstate = '42501' then
        null;
      else
        raise;
      end if;
  end;
end
$$;

reset role;

do $$
begin
  begin
    delete from public.accounts
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
    raise exception 'Expected FK restriction when deleting account with transactions';
  exception
    when others then
      if sqlstate = '23503' then
        null;
      else
        raise;
      end if;
  end;
end
$$;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);

-- User B can only read own data
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

do $$
declare
  visible_profiles integer;
  visible_accounts integer;
  visible_categories integer;
  visible_transactions integer;
begin
  select count(*) into visible_profiles from public.profiles;
  select count(*) into visible_accounts from public.accounts;
  select count(*) into visible_categories from public.categories;
  select count(*) into visible_transactions from public.transactions;

  if visible_profiles <> 1 then
    raise exception 'User B should only see 1 profile, got %', visible_profiles;
  end if;
  if visible_accounts <> 1 then
    raise exception 'User B should only see 1 account, got %', visible_accounts;
  end if;
  if visible_categories <> 1 then
    raise exception 'User B should only see 1 category, got %', visible_categories;
  end if;
  if visible_transactions <> 1 then
    raise exception 'User B should only see 1 transaction, got %', visible_transactions;
  end if;
end
$$;

rollback;
