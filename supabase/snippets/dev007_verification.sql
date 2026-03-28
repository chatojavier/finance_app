/*
DEV-007 verification
Validates:
1) Transaction direction/category kind compatibility.
2) Cross-user account/category access denial.
3) Archived-account and currency mismatch denial.
4) Derived balances still come from transactions.
*/

begin;

do $$
begin
  if not exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'validate_transaction_ownership'
  ) then
    raise exception 'Missing function: public.validate_transaction_ownership';
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
values
  (
    '88888888-8888-4888-8888-888888888881',
    'authenticated',
    'authenticated',
    'dev007-user-a@example.com',
    'dev007-hash-a',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    '99999999-9999-4999-8999-999999999992',
    'authenticated',
    'authenticated',
    'dev007-user-b@example.com',
    'dev007-hash-b',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{}'::jsonb,
    '{}'::jsonb
  )
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '88888888-8888-4888-8888-888888888881', true);

insert into public.profiles (id, name, email, base_currency)
values ('88888888-8888-4888-8888-888888888881', 'DEV007 User A', 'dev007-user-a@example.com', 'PEN')
on conflict (id) do update
set name = excluded.name,
    email = excluded.email,
    base_currency = excluded.base_currency;

select set_config('request.jwt.claim.sub', '99999999-9999-4999-8999-999999999992', true);

insert into public.profiles (id, name, email, base_currency)
values ('99999999-9999-4999-8999-999999999992', 'DEV007 User B', 'dev007-user-b@example.com', 'PEN')
on conflict (id) do update
set name = excluded.name,
    email = excluded.email,
    base_currency = excluded.base_currency;

insert into public.accounts (id, user_id, name, type, currency, archived)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc7',
    '99999999-9999-4999-8999-999999999992',
    'Wallet Other User',
    'asset',
    'PEN',
    false
  )
on conflict (id) do nothing;

insert into public.categories (id, user_id, name, kind)
values
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff3',
    '99999999-9999-4999-8999-999999999992',
    'Other User Category',
    'expense'
  )
on conflict (id) do nothing;

select set_config('request.jwt.claim.sub', '88888888-8888-4888-8888-888888888881', true);

insert into public.accounts (id, user_id, name, type, currency, archived)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '88888888-8888-4888-8888-888888888881',
    'Wallet DEV007',
    'asset',
    'PEN',
    false
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    '88888888-8888-4888-8888-888888888881',
    'Archived DEV007',
    'asset',
    'PEN',
    false
  )
on conflict (id) do nothing;

insert into public.categories (id, user_id, name, kind)
values
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
    '88888888-8888-4888-8888-888888888881',
    'Sueldo DEV007',
    'income'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    '88888888-8888-4888-8888-888888888881',
    'Mercado DEV007',
    'expense'
  )
on conflict (id) do nothing;

insert into public.transactions (id, user_id, account_id, category_id, amount, direction, currency, occurred_at, note)
values
  (
    '12121212-1212-4212-8212-121212121212',
    '88888888-8888-4888-8888-888888888881',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
    100.00,
    'in',
    'PEN',
    timezone('utc', now()),
    'Ingreso válido'
  ),
  (
    '34343434-3434-4343-8343-343434343434',
    '88888888-8888-4888-8888-888888888881',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    35.00,
    'out',
    'PEN',
    timezone('utc', now()),
    'Egreso válido'
  ),
  (
    '56565656-5656-4565-8565-565656565656',
    '88888888-8888-4888-8888-888888888881',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    null,
    5.00,
    'in',
    'PEN',
    timezone('utc', now()),
    'Seed before archive'
  )
on conflict (id) do nothing;

do $$
declare
  affected_rows integer;
begin
  update public.accounts
  set archived = true
  where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';

  update public.transactions
  set note = 'Ingreso válido actualizado'
  where id = '56565656-5656-4565-8565-565656565656';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'Expected update on existing archived-account transaction to succeed';
  end if;
end
$$;

do $$
begin
  begin
    insert into public.transactions (user_id, account_id, amount, direction, currency, occurred_at)
    values (
      '88888888-8888-4888-8888-888888888881',
      'cccccccc-cccc-4ccc-8ccc-ccccccccccc7',
      10.00,
      'in',
      'PEN',
      timezone('utc', now())
    );
    raise exception 'Expected cross-user account denial';
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
      '88888888-8888-4888-8888-888888888881',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'ffffffff-ffff-4fff-8fff-fffffffffff3',
      10.00,
      'out',
      'PEN',
      timezone('utc', now())
    );
    raise exception 'Expected cross-user category denial';
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
    insert into public.transactions (user_id, account_id, amount, direction, currency, occurred_at)
    values (
      '88888888-8888-4888-8888-888888888881',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
      10.00,
      'in',
      'PEN',
      timezone('utc', now())
    );
    raise exception 'Expected archived account denial';
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
    insert into public.transactions (user_id, account_id, amount, direction, currency, occurred_at)
    values (
      '88888888-8888-4888-8888-888888888881',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      10.00,
      'in',
      'USD',
      timezone('utc', now())
    );
    raise exception 'Expected currency mismatch denial';
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
      '88888888-8888-4888-8888-888888888881',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
      10.00,
      'in',
      'PEN',
      timezone('utc', now())
    );
    raise exception 'Expected direction/category mismatch denial';
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
declare
  derived_balance numeric;
begin
  select t.derived_balance
  into derived_balance
  from public.get_account_with_balance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1') as t;

  if derived_balance is distinct from 65.00::numeric then
    raise exception 'Expected derived balance 65.00, got %', derived_balance;
  end if;
end
$$;

rollback;
