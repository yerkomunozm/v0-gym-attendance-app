-- ============================================
-- DIAGNÓSTICO COMPLETO DEL PROBLEMA DE LOGIN
-- ============================================
-- Ejecuta este script completo en Supabase SQL Editor

-- 1. Ver TODOS los usuarios en auth.users
SELECT 
    '=== USUARIOS EN AUTH.USERS ===' as seccion,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver TODOS los usuarios en public.users
SELECT 
    '=== USUARIOS EN PUBLIC.USERS ===' as seccion,
    id,
    email,
    full_name,
    role,
    active,
    branch_id,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 3. Encontrar discrepancias
SELECT 
    '=== USUARIOS SIN PERFIL ===' as problema,
    au.id,
    au.email,
    'Usuario en auth.users pero NO en public.users' as descripcion
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 4. Encontrar usuarios inactivos
SELECT 
    '=== USUARIOS INACTIVOS ===' as problema,
    id,
    email,
    full_name,
    role,
    active,
    'Usuario existe pero está marcado como inactivo' as descripcion
FROM public.users
WHERE active = false;

-- ============================================
-- SOLUCIÓN AUTOMÁTICA
-- ============================================

-- Paso 1: Crear perfiles faltantes para usuarios en auth.users
INSERT INTO public.users (id, email, full_name, role, active)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
    'admin' as role,
    true as active
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Paso 2: Activar TODOS los usuarios
UPDATE public.users
SET active = true
WHERE active = false OR active IS NULL;

-- Paso 3: Asegurar que al menos un usuario sea admin
UPDATE public.users
SET role = 'admin'
WHERE email IN (
    SELECT email 
    FROM auth.users 
    ORDER BY created_at 
    LIMIT 1
);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 
    '=== ESTADO FINAL ===' as verificacion,
    COUNT(*) FILTER (WHERE active = true) as usuarios_activos,
    COUNT(*) FILTER (WHERE active = false) as usuarios_inactivos,
    COUNT(*) FILTER (WHERE role = 'admin') as administradores,
    COUNT(*) FILTER (WHERE role = 'trainer') as entrenadores,
    COUNT(*) FILTER (WHERE role = 'student') as estudiantes,
    COUNT(*) as total_usuarios
FROM public.users;

-- Mostrar usuarios finales
SELECT 
    '=== USUARIOS LISTOS PARA LOGIN ===' as estado,
    email,
    role,
    active,
    CASE 
        WHEN active = true THEN '✅ Puede hacer login'
        ELSE '❌ No puede hacer login (inactivo)'
    END as status
FROM public.users
ORDER BY created_at DESC;
