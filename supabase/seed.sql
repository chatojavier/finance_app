insert into public.currencies (code, name, symbol, decimals)
values
  ('PEN', 'Peruvian Sol', 'S/', 2),
  ('USD', 'US Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('BTC', 'Bitcoin', '₿', 8)
on conflict (code)
do update
set
  name = excluded.name,
  symbol = excluded.symbol,
  decimals = excluded.decimals;
