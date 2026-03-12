-- DEV-006 | Categories MVP safeguards
-- 1) Enforce normalized duplicate prevention per user + kind.
-- 2) Allow category kind changes only when category has no transactions.
-- 3) Add category_id index for transaction lookups/guards.

create or replace function public.normalize_category_name(p_name text)
returns text
language sql
immutable
returns null on null input
as $$
  select lower(regexp_replace(trim(p_name), '\s+', ' ', 'g'));
$$;

create unique index if not exists idx_categories_user_kind_name_normalized
  on public.categories (user_id, kind, public.normalize_category_name(name));

create index if not exists idx_transactions_category_id
  on public.transactions (category_id)
  where category_id is not null;

create or replace function public.prevent_category_kind_update_when_used()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.kind is distinct from old.kind
    and exists (
      select 1
      from public.transactions as t
      where t.category_id = old.id
      limit 1
    ) then
    raise exception 'categories.kind cannot change when category is already used in transactions'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_category_kind_update_when_used on public.categories;

create trigger prevent_category_kind_update_when_used
before update on public.categories
for each row
execute function public.prevent_category_kind_update_when_used();
