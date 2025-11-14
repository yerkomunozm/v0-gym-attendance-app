-- Add student_name column to attendance table
alter table public.attendance add column if not exists student_name text not null default 'Alumno';

-- Update the constraint to make student_name required
alter table public.attendance alter column student_name drop default;
