-- DEV-004 | Modelo de datos v0 + RLS (ownership por user)

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create table public.currencies (
  code text primary key,
  name text not null,
  symbol text,
  decimals integer,
  created_at timestamptz not null default timezone('utc', now()),
  constraint currencies_code_upper check (code = upper(code)),
  constraint currencies_name_not_empty check (length(trim(name)) > 0)
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  lastname text,
  email text not null,
  base_currency text not null references public.currencies (code),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_name_not_empty check (length(trim(name)) > 0),
  constraint profiles_email_not_empty check (length(trim(email)) > 0),
  constraint profiles_base_currency_upper check (base_currency = upper(base_currency))
);

create table public.accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null,
  currency text not null references public.currencies (code),
  archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint accounts_name_not_empty check (length(trim(name)) > 0),
  constraint accounts_type_valid check (type in ('asset', 'liability')),
  constraint accounts_currency_upper check (currency = upper(currency))
);

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_not_empty check (length(trim(name)) > 0),
  constraint categories_kind_valid check (kind in ('income', 'expense'))
);

create table public.transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  amount numeric(20, 8) not null,
  direction text not null,
  currency text not null references public.currencies (code),
  occurred_at timestamptz not null,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint transactions_amount_positive check (amount > 0),
  constraint transactions_direction_valid check (direction in ('in', 'out')),
  constraint transactions_currency_upper check (currency = upper(currency))
);

create or replace function public.validate_transaction_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_owner_id uuid;
  category_owner_id uuid;
begin
  select a.user_id
  into account_owner_id
  from public.accounts as a
  where a.id = new.account_id;

  if account_owner_id is null then
    raise exception 'Invalid account_id: %', new.account_id using errcode = '23503';
  end if;

  if account_owner_id <> new.user_id then
    raise exception 'transactions.account_id must belong to the same user_id'
      using errcode = '42501';
  end if;

  if new.category_id is not null then
    select c.user_id
    into category_owner_id
    from public.categories as c
    where c.id = new.category_id;

    if category_owner_id is null then
      raise exception 'Invalid category_id: %', new.category_id using errcode = '23503';
    end if;

    if category_owner_id <> new.user_id then
      raise exception 'transactions.category_id must belong to the same user_id'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_accounts_updated_at
before update on public.accounts
for each row
execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger set_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

create trigger validate_transactions_ownership
before insert or update on public.transactions
for each row
execute function public.validate_transaction_ownership();

create index idx_accounts_user_id on public.accounts (user_id);
create index idx_categories_user_id on public.categories (user_id);
create index idx_transactions_user_id on public.transactions (user_id);
create index idx_transactions_account_id on public.transactions (account_id);
create index idx_transactions_occurred_at on public.transactions (occurred_at);

alter table public.currencies enable row level security;
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "currencies_read_all"
  on public.currencies
  for select
  using (true);

create policy "profiles_select_own"
  on public.profiles
  for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_delete_own"
  on public.profiles
  for delete
  using (id = auth.uid());

create policy "accounts_select_own"
  on public.accounts
  for select
  using (user_id = auth.uid());

create policy "accounts_insert_own"
  on public.accounts
  for insert
  with check (user_id = auth.uid());

create policy "accounts_update_own"
  on public.accounts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "accounts_delete_own"
  on public.accounts
  for delete
  using (user_id = auth.uid());

create policy "categories_select_own"
  on public.categories
  for select
  using (user_id = auth.uid());

create policy "categories_insert_own"
  on public.categories
  for insert
  with check (user_id = auth.uid());

create policy "categories_update_own"
  on public.categories
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "categories_delete_own"
  on public.categories
  for delete
  using (user_id = auth.uid());

create policy "transactions_select_own"
  on public.transactions
  for select
  using (user_id = auth.uid());

create policy "transactions_insert_own"
  on public.transactions
  for insert
  with check (user_id = auth.uid());

create policy "transactions_update_own"
  on public.transactions
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "transactions_delete_own"
  on public.transactions
  for delete
  using (user_id = auth.uid());
