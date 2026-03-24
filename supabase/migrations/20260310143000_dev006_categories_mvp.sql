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

do $$
declare
  duplicate_record record;
begin
  select
    c.user_id,
    c.kind,
    public.normalize_category_name(c.name) as normalized_name,
    count(*)::integer as duplicate_count
  into duplicate_record
  from public.categories as c
  group by c.user_id, c.kind, public.normalize_category_name(c.name)
  having count(*) > 1
  order by count(*) desc, c.user_id, c.kind, public.normalize_category_name(c.name)
  limit 1;

  if duplicate_record is not null then
    raise exception
      'DEV-006 migration aborted: duplicate categories already exist for user %, kind %, normalized name "%", count %',
      duplicate_record.user_id,
      duplicate_record.kind,
      duplicate_record.normalized_name,
      duplicate_record.duplicate_count
      using errcode = '23505';
  end if;
end
$$;

create unique index if not exists idx_categories_user_kind_name_normalized
  on public.categories (user_id, kind, public.normalize_category_name(name));

create index if not exists idx_transactions_category_id
  on public.transactions (category_id)
  where category_id is not null;

create or replace function public.find_category_duplicate_by_name(
  p_kind text,
  p_name text,
  p_exclude_category_id uuid default null
)
returns table (
  id uuid,
  name text
)
language sql
stable
security invoker
set search_path = public
as $$
  select c.id, c.name
  from public.categories as c
  where c.user_id = auth.uid()
    and c.kind = p_kind
    and public.normalize_category_name(c.name) = public.normalize_category_name(p_name)
    and (p_exclude_category_id is null or c.id <> p_exclude_category_id)
  limit 1;
$$;

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
