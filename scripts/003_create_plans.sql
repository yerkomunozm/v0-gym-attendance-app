-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert to plans" ON plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to plans" ON plans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to plans" ON plans FOR DELETE USING (true);

-- Add plan_id to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);

-- Insert default plans
INSERT INTO plans (name, description, price) VALUES
  ('PLAN LIBRE', 'Acceso libre a todas las instalaciones', 0),
  ('PLAN ESTUDIANTE', 'Descuento especial para estudiantes', 0),
  ('PLAN SEMIPERSONALIZADO', 'Entrenamiento en grupos pequeños con instructor', 0),
  ('PLAN INDIVIDUAL 1:1', 'Entrenamiento personalizado exclusivo', 0),
  ('PASE DIARIO', 'Acceso por un día', 0);
