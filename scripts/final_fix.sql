-- ============================================
-- VERIFICACIÓN COMPLETA DE IDS Y RLS
-- ============================================

-- 1. Ver usuarios en auth.users con sus IDs
SELECT 
    '=== AUTH.USERS ===' as seccion,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users
ORDER BY email;

-- 2. Ver usuarios en public.users con sus IDs
SELECT 
    '=== PUBLIC.USERS ===' as seccion,
    id,
    email,
    role,
    active
FROM public.users
ORDER BY email;

-- 3. Comparar IDs (CRÍTICO)
SELECT 
    '=== COMPARACIÓN DE IDS ===' as verificacion,
    au.email,
    au.id as id_en_auth,
    pu.id as id_en_public,
    CASE 
        WHEN au.id = pu.id THEN '✅ CORRECTO'
        WHEN pu.id IS NULL THEN '❌ FALTA EN PUBLIC.USERS'
        ELSE '❌ IDS NO COINCIDEN'
    END as estado
FROM auth.users au
LEFT JOIN public.users pu ON au.email = pu.email
ORDER BY au.email;

-- 4. Verificar políticas RLS en public.users
SELECT 
    '=== POLÍTICAS RLS ===' as verificacion,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- ============================================
-- SOLUCIÓN DEFINITIVA
-- ============================================

-- Paso 1: DESHABILITAR temporalmente RLS para diagnóstico
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Paso 2: Limpiar y recrear usuarios con IDs correctos
TRUNCATE TABLE public.users CASCADE;

-- Paso 3: Insertar usuarios con IDs correctos desde auth.users
INSERT INTO public.users (id, email, full_name, role, active, created_at, updated_at)
SELECT 
    au.id,  -- USAR EL ID DE AUTH.USERS
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
    CASE 
        WHEN au.email ILIKE '%admin%' THEN 'admin'
        WHEN au.email ILIKE '%trainer%' THEN 'trainer'
        WHEN au.email ILIKE '%student%' THEN 'student'
        ELSE 'student'
    END as role,
    true as active,
    au.created_at,
    now() as updated_at
FROM auth.users au;

-- Paso 4: REHABILITAR RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que los IDs ahora coinciden
SELECT 
    '=== VERIFICACIÓN FINAL ===' as resultado,
    au.email,
    au.id as auth_id,
    pu.id as public_id,
    pu.role,
    pu.active,
    CASE 
        WHEN au.id = pu.id AND pu.active = true THEN '✅ TODO CORRECTO'
        WHEN au.id != pu.id THEN '❌ IDS NO COINCIDEN'
        WHEN pu.active = false THEN '❌ USUARIO INACTIVO'
        ELSE '❌ ERROR DESCONOCIDO'
    END as estado
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.email;

-- Contar usuarios
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(*) FILTER (WHERE active = true) as usuarios_activos,
    COUNT(*) FILTER (WHERE role = 'admin') as admins
FROM public.users;
