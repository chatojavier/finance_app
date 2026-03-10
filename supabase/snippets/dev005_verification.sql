-- DEV-005 verification
-- Validates: immutable account currency + archived accounts transaction guard.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'prevent_accounts_currency_update'
      and tgrelid = 'public.accounts'::regclass
      and not tgisinternal
  ) then
    raise exception 'Missing trigger: prevent_accounts_currency_update';
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
  '33333333-3333-4333-8333-333333333333',
  'authenticated',
  'authenticated',
  'dev005-user@example.com',
  'dev005-hash',
  timezone('utc', now()),
  timezone('utc', now()),
  timezone('utc', now()),
  '{}'::jsonb,
  '{}'::jsonb
)
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);

insert into public.profiles (id, name, email, base_currency)
values ('33333333-3333-4333-8333-333333333333', 'DEV005 User', 'dev005-user@example.com', 'PEN')
on conflict (id) do update
set name = excluded.name,
    email = excluded.email,
    base_currency = excluded.base_currency;

insert into public.accounts (id, user_id, name, type, currency, archived)
values (
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
  '33333333-3333-4333-8333-333333333333',
  'Wallet DEV005',
  'asset',
  'PEN',
  false
);

insert into public.transactions (id, user_id, account_id, amount, direction, currency, occurred_at, note)
values (
  'dddddddd-dddd-4ddd-8ddd-ddddddddddd3',
  '33333333-3333-4333-8333-333333333333',
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
  30.00,
  'in',
  'PEN',
  timezone('utc', now()),
  'Before archive'
);

do $$
begin
  begin
    update public.accounts
    set currency = 'USD'
    where id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3';
    raise exception 'Expected immutable currency violation';
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

update public.accounts
set archived = true
where id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3';

do $$
declare
  affected_rows integer;
begin
  update public.transactions
  set note = 'Updated after archive'
  where id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd3';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'Expected update to existing archived-account transaction to succeed';
  end if;
end
$$;

do $$
begin
  begin
    insert into public.transactions (user_id, account_id, amount, direction, currency, occurred_at)
    values (
      '33333333-3333-4333-8333-333333333333',
      'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
      15.00,
      'in',
      'PEN',
      timezone('utc', now())
    );
    raise exception 'Expected archived account transaction denial';
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

rollback;
