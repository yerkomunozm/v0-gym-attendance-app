-- Update Row Level Security (RLS) policies for all tables
-- This implements role-based access control at the database level

-- Helper function to get the current user's role
create or replace function public.get_user_role()
returns text as $$
  select role from public.users where id = auth.uid();
$$ language sql security definer stable;

-- Helper function to get the current user's branch_id
create or replace function public.get_user_branch_id()
returns uuid as $$
  select branch_id from public.users where id = auth.uid();
$$ language sql security definer stable;

-- ============================================================
-- POLICIES FOR TRAINERS TABLE
-- ============================================================

-- Drop existing public policies
drop policy if exists "Allow public read access to trainers" on public.trainers;
drop policy if exists "Allow public insert to trainers" on public.trainers;
drop policy if exists "Allow public update to trainers" on public.trainers;
drop policy if exists "Allow public delete to trainers" on public.trainers;

-- Admins can view all trainers
create policy "Admins can view all trainers"
  on public.trainers for select
  using (get_user_role() = 'admin');

-- Trainers can view trainers from their branch
create policy "Trainers can view trainers from their branch"
  on public.trainers for select
  using (
    get_user_role() = 'trainer' and 
    branch_id = get_user_branch_id()
  );

-- Students can view trainers from their branch
create policy "Students can view trainers from their branch"
  on public.trainers for select
  using (
    get_user_role() = 'student' and 
    branch_id = get_user_branch_id()
  );

-- Only admins can insert trainers
create policy "Admins can insert trainers"
  on public.trainers for insert
  with check (get_user_role() = 'admin');

-- Only admins can update trainers
create policy "Admins can update trainers"
  on public.trainers for update
  using (get_user_role() = 'admin');

-- Only admins can delete trainers
create policy "Admins can delete trainers"
  on public.trainers for delete
  using (get_user_role() = 'admin');

-- ============================================================
-- POLICIES FOR STUDENTS TABLE
-- ============================================================

-- Drop existing public policies
drop policy if exists "Allow public read access to students" on public.students;
drop policy if exists "Allow public insert to students" on public.students;
drop policy if exists "Allow public update to students" on public.students;
drop policy if exists "Allow public delete to students" on public.students;

-- Admins can view all students
create policy "Admins can view all students"
  on public.students for select
  using (get_user_role() = 'admin');

-- Trainers can view students from their branch
create policy "Trainers can view students from their branch"
  on public.students for select
  using (
    get_user_role() = 'trainer' and 
    branch_id = get_user_branch_id()
  );

-- Students can view their own profile
create policy "Students can view their own profile"
  on public.students for select
  using (
    get_user_role() = 'student' and 
    user_id = auth.uid()
  );

-- Admins can insert students
create policy "Admins can insert students"
  on public.students for insert
  with check (get_user_role() = 'admin');

-- Trainers can insert students in their branch
create policy "Trainers can insert students in their branch"
  on public.students for insert
  with check (
    get_user_role() = 'trainer' and
    branch_id = get_user_branch_id()
  );

-- Admins can update any student
create policy "Admins can update students"
  on public.students for update
  using (get_user_role() = 'admin');

-- Trainers can update students from their branch
create policy "Trainers can update students from their branch"
  on public.students for update
  using (
    get_user_role() = 'trainer' and
    branch_id = get_user_branch_id()
  );

-- Admins can delete students
create policy "Admins can delete students"
  on public.students for delete
  using (get_user_role() = 'admin');

-- ============================================================
-- POLICIES FOR ATTENDANCE TABLE
-- ============================================================

-- Drop existing public policies
drop policy if exists "Allow public read access to attendance" on public.attendance;
drop policy if exists "Allow public insert to attendance" on public.attendance;
drop policy if exists "Allow public update to attendance" on public.attendance;
drop policy if exists "Allow public delete to attendance" on public.attendance;

-- Admins can view all attendance records
create policy "Admins can view all attendance"
  on public.attendance for select
  using (get_user_role() = 'admin');

-- Trainers can view attendance from their branch
create policy "Trainers can view attendance from their branch"
  on public.attendance for select
  using (
    get_user_role() = 'trainer' and 
    branch_id = get_user_branch_id()
  );

-- Students can view only their own attendance records
create policy "Students can view their own attendance"
  on public.attendance for select
  using (
    get_user_role() = 'student' and 
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
  );

-- All authenticated users can insert attendance (for check-in)
create policy "Authenticated users can insert attendance"
  on public.attendance for insert
  with check (auth.uid() is not null);

-- Only admins can update attendance
create policy "Admins can update attendance"
  on public.attendance for update
  using (get_user_role() = 'admin');

-- Only admins can delete attendance
create policy "Admins can delete attendance"
  on public.attendance for delete
  using (get_user_role() = 'admin');

-- ============================================================
-- POLICIES FOR BRANCHES TABLE
-- ============================================================

-- Drop existing public policies if any
drop policy if exists "Allow public read access to branches" on public.branches;
drop policy if exists "Allow public insert to branches" on public.branches;
drop policy if exists "Allow public update to branches" on public.branches;
drop policy if exists "Allow public delete to branches" on public.branches;

-- All authenticated users can view branches
create policy "Authenticated users can view branches"
  on public.branches for select
  using (auth.uid() is not null);

-- Only admins can insert branches
create policy "Admins can insert branches"
  on public.branches for insert
  with check (get_user_role() = 'admin');

-- Only admins can update branches
create policy "Admins can update branches"
  on public.branches for update
  using (get_user_role() = 'admin');

-- Only admins can delete branches
create policy "Admins can delete branches"
  on public.branches for delete
  using (get_user_role() = 'admin');

-- ============================================================
-- POLICIES FOR PLANS TABLE
-- ============================================================

-- Drop existing public policies if any
drop policy if exists "Allow public read access to plans" on public.plans;
drop policy if exists "Allow public insert to plans" on public.plans;
drop policy if exists "Allow public update to plans" on public.plans;
drop policy if exists "Allow public delete to plans" on public.plans;

-- All authenticated users can view plans
create policy "Authenticated users can view plans"
  on public.plans for select
  using (auth.uid() is not null);

-- Only admins can insert plans
create policy "Admins can insert plans"
  on public.plans for insert
  with check (get_user_role() = 'admin');

-- Only admins can update plans
create policy "Admins can update plans"
  on public.plans for update
  using (get_user_role() = 'admin');

-- Only admins can delete plans
create policy "Admins can delete plans"
  on public.plans for delete
  using (get_user_role() = 'admin');
