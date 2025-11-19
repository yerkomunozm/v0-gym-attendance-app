-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add branch_id to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Add branch_id to trainers table
ALTER TABLE public.trainers
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Add branch_id to attendance table (optional, for better tracking)
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create policies for branches (allow all operations for now)
CREATE POLICY "Allow public read access to branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Allow public insert to branches" ON public.branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to branches" ON public.branches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to branches" ON public.branches FOR DELETE USING (true);

-- Insert sample branches
INSERT INTO public.branches (name, address, phone, active)
VALUES 
  ('Sede Central', 'Av. Principal 123', '+1234567890', true),
  ('Sede Norte', 'Calle Norte 456', '+1234567891', true),
  ('Sede Sur', 'Calle Sur 789', '+1234567892', true)
ON CONFLICT DO NOTHING;
