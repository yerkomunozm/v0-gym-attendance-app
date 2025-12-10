-- ============================================
-- SOLUCIÓN: Habilitar acceso público de lectura
-- para las tablas necesarias en el flujo de asistencia
-- ============================================

-- Nota: El flujo de asistencia "público" (kiosco/QR) requiere leer
-- entrenadores y alumnos sin estar autenticado.

-- 0. Asegurar permisos a nivel de esquema y tabla (GRANTS)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.trainers TO anon;
GRANT SELECT ON public.students TO anon;
-- (Opcional) GRANT INSERT ON public.attendance TO anon;


-- 1. Tabla TRAINERS
-- Eliminar política restrictiva anterior si existe (evitar conflictos)
DROP POLICY IF EXISTS "Allow public read access to trainers" ON public.trainers;

-- Crear política de lectura pública
CREATE POLICY "Allow public read access to trainers"
  ON public.trainers FOR SELECT
  TO anon, authenticated
  USING (true);  -- 'true' significa acceso para todos


-- 2. Tabla STUDENTS
-- Eliminar política restrictiva anterior si existe
DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;

-- Crear política de lectura pública
CREATE POLICY "Allow public read access to students"
  ON public.students FOR SELECT
  TO anon, authenticated
  USING (true); -- 'true' significa acceso para todos


-- 3. Tabla ATTENDANCE
-- Permitir a usuarios anónimos registrar asistencia
DROP POLICY IF EXISTS "Allow public insert to attendance" ON public.attendance;

CREATE POLICY "Allow public insert to attendance"
  ON public.attendance FOR INSERT
  TO anon, authenticated
  WITH CHECK (true); -- Permite a cualquiera insertar


-- 4. Verificación rápida
-- Ejecuta esto y verifica que aparezcan las políticas creadas arriba
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('trainers', 'students', 'attendance')
  AND policyname LIKE 'Allow public%'
ORDER BY tablename, policyname;
