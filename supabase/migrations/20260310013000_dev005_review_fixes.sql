-- DEV-005 review fixes
-- 1) Archived-account guard should block new inserts, not metadata updates on existing rows.

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

  if account_archived and tg_op = 'INSERT' then
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
