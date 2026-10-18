-- Lin Htet IT Service: Supabase Database Schema
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category text,
  image text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists product_files (
  product_id uuid primary key references products(id) on delete cascade,
  url text not null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  no text unique,
  customer_name text,
  contact text,
  note text,
  items jsonb,
  total numeric,
  pay_method text,
  slip text,
  status text default 'new',
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;
alter table product_files enable row level security;
alter table orders enable row level security;

-- Policies
create policy "public read products" on products for select using (active = true);
create policy "admin all products" on products for all to authenticated using (true) with check (true);
create policy "admin all files" on product_files for all to authenticated using (true) with check (true);
create policy "admin all orders" on orders for all to authenticated using (true) with check (true);

-- Enable realtime subscriptions for orders
alter publication supabase_realtime add table orders;

-- Storage bucket for slips
insert into storage.buckets (id, name, public) 
values ('slips', 'slips', true)
on conflict (id) do nothing;

create policy "anon upload slips" on storage.objects 
for insert to anon 
with check (bucket_id = 'slips');

create policy "public read slips" on storage.objects
for select using (bucket_id = 'slips');
