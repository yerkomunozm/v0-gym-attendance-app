-- ============================================
-- SOLUCIÓN RÁPIDA: Activar usuario
-- ============================================
-- El error "?error=inactive" significa que el usuario 
-- está marcado como inactivo en la base de datos

-- 1. Ver el estado actual de los usuarios
SELECT 
    id,
    email,
    full_name,
    role,
    active,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 2. ACTIVAR el usuario (reemplaza el email con el tuyo)
UPDATE public.users
SET active = true
WHERE email = 'admin@test.com';  -- Cambia por tu email

-- 3. Verificar que se activó correctamente
SELECT 
    email,
    role,
    active,
    'Usuario activado correctamente' as status
FROM public.users
WHERE email = 'admin@test.com';  -- Cambia por tu email

-- ============================================
-- Si quieres activar TODOS los usuarios:
-- ============================================
UPDATE public.users
SET active = true
WHERE active = false;

-- Ver cuántos usuarios se activaron
SELECT 
    COUNT(*) as usuarios_activos
FROM public.users
WHERE active = true;
