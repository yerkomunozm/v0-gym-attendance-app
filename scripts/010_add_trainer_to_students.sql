-- Add trainer_id column to students table
-- This allows associating students with their assigned trainer

-- Add the trainer_id column (nullable to support existing students)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS trainer_id uuid;

-- Add foreign key constraint to trainers table
-- ON DELETE SET NULL ensures that if a trainer is deleted, students remain but lose the association
ALTER TABLE public.students
ADD CONSTRAINT fk_students_trainer
FOREIGN KEY (trainer_id) 
REFERENCES public.trainers(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_students_trainer_id ON public.students(trainer_id);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
  AND column_name = 'trainer_id';
