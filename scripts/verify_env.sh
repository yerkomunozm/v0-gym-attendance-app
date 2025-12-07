#!/bin/bash

# Script de verificación de configuración de Supabase
# Este script verifica que las variables de entorno estén configuradas

echo "🔍 Verificando configuración de Supabase..."
echo ""

# Verificar que .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ ERROR: Archivo .env.local no encontrado"
    echo "   Copia .env.local.example a .env.local y configura tus credenciales"
    exit 1
fi

echo "✅ Archivo .env.local encontrado"
echo ""

# Verificar variables requeridas (sin mostrar valores)
echo "📋 Verificando variables de entorno requeridas:"
echo ""

check_var() {
    local var_name=$1
    if grep -q "^${var_name}=" .env.local 2>/dev/null; then
        local value=$(grep "^${var_name}=" .env.local | cut -d'=' -f2)
        if [ -n "$value" ] && [ "$value" != "your-project-url" ] && [ "$value" != "your-anon-key" ]; then
            echo "✅ $var_name está configurado"
            return 0
        else
            echo "❌ $var_name está vacío o tiene valor por defecto"
            return 1
        fi
    else
        echo "❌ $var_name no encontrado"
        return 1
    fi
}

errors=0

check_var "NEXT_PUBLIC_SUPABASE_URL" || ((errors++))
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" || ((errors++))

echo ""

if [ $errors -eq 0 ]; then
    echo "✅ Todas las variables de entorno están configuradas correctamente"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Ve a Supabase Dashboard → SQL Editor"
    echo "   2. Ejecuta el script: scripts/verify_database.sql"
    echo "   3. Verifica que todas las tablas y políticas existan"
else
    echo "❌ Hay $errors variable(s) sin configurar"
    echo ""
    echo "📝 Para configurar:"
    echo "   1. Ve a tu proyecto en Supabase Dashboard"
    echo "   2. Settings → API"
    echo "   3. Copia 'Project URL' y 'anon public' key"
    echo "   4. Actualiza .env.local con estos valores"
fi

echo ""
echo "🔗 Recursos útiles:"
echo "   - Supabase Dashboard: https://supabase.com/dashboard"
echo "   - Guía rápida: QUICK_START.md"
