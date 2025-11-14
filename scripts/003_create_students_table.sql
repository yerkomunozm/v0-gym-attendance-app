-- Create students table
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  membership_status text default 'active',
  registration_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.students enable row level security;

-- Create policies for students table
create policy "Allow public read access to students"
  on public.students for select
  using (true);

create policy "Allow public insert to students"
  on public.students for insert
  with check (true);

create policy "Allow public update to students"
  on public.students for update
  using (true);

create policy "Allow public delete to students"
  on public.students for delete
  using (true);

-- Create index for faster queries
create index if not exists idx_students_name on public.students(name);
create index if not exists idx_students_membership_status on public.students(membership_status);
