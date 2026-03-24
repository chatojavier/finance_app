-- DEV-007 | Transactions MVP guards
-- Enforce category kind compatibility with transaction direction.

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
  category_kind text;
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

  if new.category_id is not null then
    select c.kind
    into category_kind
    from public.categories as c
    where c.id = new.category_id
      and c.user_id = trusted_user_id;

    if category_kind is null then
      raise exception 'Invalid account or category reference for transaction'
        using errcode = '42501';
    end if;

    if (new.direction = 'in' and category_kind <> 'income')
      or (new.direction = 'out' and category_kind <> 'expense') then
      raise exception 'transactions.category_id kind must match direction'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;
