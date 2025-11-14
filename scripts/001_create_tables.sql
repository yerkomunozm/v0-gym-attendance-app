-- Create trainers table
create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  specialty text,
  qr_code text not null unique,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Create attendance table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  check_in_time timestamp with time zone default now(),
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.trainers enable row level security;
alter table public.attendance enable row level security;

-- Create policies for trainers table (allow all operations for now - can be restricted later with auth)
create policy "Allow public read access to trainers"
  on public.trainers for select
  using (true);

create policy "Allow public insert to trainers"
  on public.trainers for insert
  with check (true);

create policy "Allow public update to trainers"
  on public.trainers for update
  using (true);

create policy "Allow public delete to trainers"
  on public.trainers for delete
  using (true);

-- Create policies for attendance table
create policy "Allow public read access to attendance"
  on public.attendance for select
  using (true);

create policy "Allow public insert to attendance"
  on public.attendance for insert
  with check (true);

create policy "Allow public update to attendance"
  on public.attendance for update
  using (true);

create policy "Allow public delete to attendance"
  on public.attendance for delete
  using (true);

-- Create index for faster queries
create index if not exists idx_attendance_trainer_id on public.attendance(trainer_id);
create index if not exists idx_attendance_check_in_time on public.attendance(check_in_time);
create index if not exists idx_trainers_qr_code on public.trainers(qr_code);
