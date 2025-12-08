-- ============================================
-- Verificar y arreglar políticas RLS para branches
-- ============================================

-- Ver políticas actuales en branches
SELECT 
    '=== POLÍTICAS ACTUALES EN BRANCHES ===' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'branches'
ORDER BY policyname;

-- Si no hay políticas o están mal configuradas, ejecuta esto:

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can insert branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can update branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can delete branches" ON public.branches;

-- Crear políticas correctas
-- LECTURA: Todos los usuarios autenticados pueden ver branches
CREATE POLICY "Authenticated users can read branches"
  ON public.branches FOR SELECT
  TO authenticated
  USING (true);

-- INSERTAR: Solo admins
CREATE POLICY "Admins can insert branches"
  ON public.branches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ACTUALIZAR: Solo admins
CREATE POLICY "Admins can update branches"
  ON public.branches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ELIMINAR: Solo admins
CREATE POLICY "Admins can delete branches"
  ON public.branches FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verificar que las políticas se crearon
SELECT 
    '=== POLÍTICAS NUEVAS ===' as info,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'branches'
ORDER BY policyname;
