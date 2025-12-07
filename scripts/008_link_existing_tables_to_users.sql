-- Link existing tables (trainers and students) to the new users table
-- This allows us to associate trainers and students with authenticated users

-- Add user_id column to trainers table
alter table public.trainers 
  add column if not exists user_id uuid references public.users(id) on delete set null;

-- Add user_id column to students table
alter table public.students 
  add column if not exists user_id uuid references public.users(id) on delete set null;

-- Create indexes for better query performance
create index if not exists idx_trainers_user_id on public.trainers(user_id);
create index if not exists idx_students_user_id on public.students(user_id);

-- Add comment to explain the relationship
comment on column public.trainers.user_id is 'References the authenticated user account for this trainer';
comment on column public.students.user_id is 'References the authenticated user account for this student';
