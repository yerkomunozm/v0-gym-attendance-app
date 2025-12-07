-- ============================================
-- SOLUCIÓN: Arreglar políticas RLS para tabla users
-- ============================================
-- El problema es que las políticas RLS actuales requieren
-- que el usuario YA esté autenticado para leer su propio perfil,
-- pero necesitamos leer el perfil DURANTE la autenticación.

-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- NUEVA POLÍTICA: Permitir lectura a usuarios autenticados
-- Esto permite que el proxy/middleware lea el perfil del usuario
CREATE POLICY "Authenticated users can read users table"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Permitir a usuarios autenticados leer su propio perfil
CREATE POLICY "Users can read their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Solo admins pueden insertar usuarios
CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuarios pueden actualizar su propio perfil (campos limitados)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins pueden actualizar cualquier usuario
CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verificar políticas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;
