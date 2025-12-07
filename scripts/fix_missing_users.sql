-- ============================================
-- SCRIPT DE DIAGNÓSTICO Y SOLUCIÓN
-- ============================================
-- Ejecuta este script en Supabase SQL Editor

-- 1. Ver usuarios en auth.users
SELECT 
    'Usuarios en auth.users' as tabla,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver usuarios en public.users
SELECT 
    'Usuarios en public.users' as tabla,
    id,
    email,
    full_name,
    role,
    active
FROM public.users
ORDER BY created_at DESC;

-- 3. Encontrar usuarios que están en auth.users pero NO en public.users
SELECT 
    'Usuarios SIN perfil' as problema,
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================
-- SOLUCIÓN: Crear perfiles manualmente
-- ============================================
-- Si hay usuarios sin perfil, ejecuta esto para cada uno:

-- IMPORTANTE: Reemplaza 'EMAIL_DEL_USUARIO' con el email real
INSERT INTO public.users (id, email, full_name, role, active)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    'admin' as role,  -- Cambia a 'trainer' o 'student' según corresponda
    true as active
FROM auth.users
WHERE email = 'admin@test.com'  -- Reemplaza con el email correcto
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    full_name = 'Administrador Principal',
    active = true;

-- ============================================
-- VERIFICAR TRIGGER
-- ============================================
-- Verifica que el trigger existe y está activo
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Si el trigger NO existe, créalo:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, active)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
