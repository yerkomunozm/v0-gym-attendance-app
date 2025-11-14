-- Add student_id column to attendance table
alter table public.attendance add column if not exists student_id uuid references public.students(id) on delete set null;

-- Create index for the new foreign key
create index if not exists idx_attendance_student_id on public.attendance(student_id);

-- Note: student_name column will remain for backward compatibility and manual entries
