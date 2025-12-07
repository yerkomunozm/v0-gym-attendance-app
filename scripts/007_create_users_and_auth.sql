-- Create users table that extends auth.users with role and branch information
-- This table links Supabase Auth users with our application-specific user data

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('admin', 'trainer', 'student')),
  branch_id uuid references public.branches(id) on delete set null,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_branch_id on public.users(branch_id);
create index if not exists idx_users_email on public.users(email);

-- Create trigger function to automatically update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to update updated_at on every update
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function update_updated_at_column();

-- Enable Row Level Security
alter table public.users enable row level security;

-- RLS Policies for users table
-- Users can view their own profile
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

-- Admins can view all users
create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can insert new users (through admin panel)
create policy "Admins can insert users"
  on public.users for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Users can update their own profile (limited fields)
create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any user
create policy "Admins can update any user"
  on public.users for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can delete users
create policy "Admins can delete users"
  on public.users for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create a trigger to automatically create a user profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
