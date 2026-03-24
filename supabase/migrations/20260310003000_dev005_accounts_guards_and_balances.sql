-- DEV-005 | Accounts MVP hard rules and derived balance reads
-- 1) Account currency is immutable after creation.
-- 2) Archived accounts cannot receive new transactions.
-- 3) Expose SQL-derived balances for accounts listings/details.

create or replace function public.prevent_account_currency_update()
returns trigger
language plpgsql
as $$
begin
  if new.currency <> old.currency then
    raise exception 'accounts.currency is immutable after creation'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_accounts_currency_update on public.accounts;

create trigger prevent_accounts_currency_update
before update on public.accounts
for each row
execute function public.prevent_account_currency_update();

create or replace function public.validate_transaction_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  trusted_user_id uuid;
  account_currency text;
  account_archived boolean;
begin
  trusted_user_id := auth.uid();

  if trusted_user_id is null or new.user_id is distinct from trusted_user_id then
    raise exception 'Invalid account or category reference for transaction'
      using errcode = '42501';
  end if;

  select a.currency, a.archived
  into account_currency, account_archived
  from public.accounts as a
  where a.id = new.account_id
    and a.user_id = trusted_user_id;

  if account_currency is null then
    raise exception 'Invalid account or category reference for transaction'
      using errcode = '42501';
  end if;

  if account_archived then
    raise exception 'transactions are not allowed on archived accounts'
      using errcode = '23514';
  end if;

  if new.currency <> account_currency then
    raise exception 'transactions.currency must match account currency'
      using errcode = '23514';
  end if;

  if new.category_id is not null
     and not exists (
       select 1
       from public.categories as c
       where c.id = new.category_id
         and c.user_id = trusted_user_id
     ) then
    raise exception 'Invalid account or category reference for transaction'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.get_accounts_with_balance(p_include_archived boolean default false)
returns table (
  id uuid,
  name text,
  type text,
  currency text,
  archived boolean,
  created_at timestamptz,
  updated_at timestamptz,
  derived_balance numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    a.id,
    a.name,
    a.type,
    a.currency,
    a.archived,
    a.created_at,
    a.updated_at,
    coalesce(
      sum(
        case
          when t.direction = 'in' then t.amount
          when t.direction = 'out' then -t.amount
          else 0::numeric
        end
      ),
      0::numeric
    ) as derived_balance
  from public.accounts as a
  left join public.transactions as t
    on t.account_id = a.id
    and t.user_id = a.user_id
  where a.user_id = auth.uid()
    and (p_include_archived or not a.archived)
  group by a.id
  order by a.created_at desc;
$$;

create or replace function public.get_account_with_balance(p_account_id uuid)
returns table (
  id uuid,
  name text,
  type text,
  currency text,
  archived boolean,
  created_at timestamptz,
  updated_at timestamptz,
  derived_balance numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    a.id,
    a.name,
    a.type,
    a.currency,
    a.archived,
    a.created_at,
    a.updated_at,
    coalesce(
      sum(
        case
          when t.direction = 'in' then t.amount
          when t.direction = 'out' then -t.amount
          else 0::numeric
        end
      ),
      0::numeric
    ) as derived_balance
  from public.accounts as a
  left join public.transactions as t
    on t.account_id = a.id
    and t.user_id = a.user_id
  where a.id = p_account_id
    and a.user_id = auth.uid()
  group by a.id;
$$;
