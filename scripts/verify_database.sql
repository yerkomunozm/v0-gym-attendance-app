-- ============================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- ============================================
-- Ejecuta este script en Supabase SQL Editor para verificar
-- que todas las tablas y configuraciones estén correctas

-- 1. Verificar que la tabla users existe
SELECT 
    'users table' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status;

-- 2. Verificar columnas de la tabla users
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar que trainers y students tienen user_id
SELECT 
    'trainers.user_id' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'trainers' AND column_name = 'user_id'
        ) 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status
UNION ALL
SELECT 
    'students.user_id' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'students' AND column_name = 'user_id'
        ) 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status;

-- 4. Contar registros en cada tabla
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'trainers' as table_name, COUNT(*) as record_count FROM trainers
UNION ALL
SELECT 'students' as table_name, COUNT(*) as record_count FROM students
UNION ALL
SELECT 'branches' as table_name, COUNT(*) as record_count FROM branches
UNION ALL
SELECT 'attendance' as table_name, COUNT(*) as record_count FROM attendance;

-- 5. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verificar funciones helper
SELECT 
    'get_user_role()' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_user_role'
        ) 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status
UNION ALL
SELECT 
    'get_user_branch_id()' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_user_branch_id'
        ) 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status;

-- 7. Verificar usuarios en auth.users vs public.users
SELECT 
    'Total auth.users' as metric,
    COUNT(*)::text as value
FROM auth.users
UNION ALL
SELECT 
    'Total public.users' as metric,
    COUNT(*)::text as value
FROM public.users
UNION ALL
SELECT 
    'Users without profile' as metric,
    COUNT(*)::text as value
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 8. Listar usuarios existentes (sin datos sensibles)
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.active,
    b.name as branch_name,
    u.created_at
FROM users u
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.created_at DESC;

-- 9. Verificar trigger de auto-creación de perfil
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- ✅ Tabla users debe existir
-- ✅ Debe tener columnas: id, email, full_name, role, branch_id, active
-- ✅ trainers y students deben tener columna user_id
-- ✅ Debe haber políticas RLS para cada tabla
-- ✅ Funciones get_user_role() y get_user_branch_id() deben existir
-- ✅ Trigger on_auth_user_created debe existir
