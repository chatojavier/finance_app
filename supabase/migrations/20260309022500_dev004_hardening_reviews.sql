-- DEV-004 hardening after PR review
-- 1) Prevent hard delete data loss on account deletions.
-- 2) Enforce transaction currency consistency with account currency.
-- 3) Avoid cross-tenant existence leakage in ownership validation errors.

alter table public.transactions
  drop constraint if exists transactions_account_id_fkey;

alter table public.transactions
  add constraint transactions_account_id_fkey
  foreign key (account_id) references public.accounts (id) on delete restrict;

drop policy if exists "accounts_delete_own" on public.accounts;

create or replace function public.validate_transaction_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_currency text;
begin
  select a.currency
  into account_currency
  from public.accounts as a
  where a.id = new.account_id
    and a.user_id = new.user_id;

  if account_currency is null then
    raise exception 'Invalid account or category reference for transaction'
      using errcode = '42501';
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
         and c.user_id = new.user_id
     ) then
    raise exception 'Invalid account or category reference for transaction'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
