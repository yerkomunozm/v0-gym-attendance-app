import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateTrainerRequest {
    name: string
    email: string
    phone?: string
    specialty?: string
    branch_id: string
    password: string
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the Auth context of the logged in user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Verify the user is authenticated and is an admin
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'No autenticado' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userError || userData?.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'No tienes permisos para crear entrenadores' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        // Parse request body
        const { name, email, phone, specialty, branch_id, password }: CreateTrainerRequest = await req.json()

        // Validate required fields
        if (!name || !email || !branch_id || !password) {
            return new Response(
                JSON.stringify({ error: 'Nombre, email, sede y contraseña son obligatorios' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({ error: 'Formato de email inválido' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Create Supabase Admin client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Step 1: Create user in auth.users with metadata
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: name,
                role: 'trainer',
                password_change_required: true,
                branch_id: branch_id
            }
        })

        if (authError) {
            console.error('Error creating auth user:', authError)
            return new Response(
                JSON.stringify({
                    error: authError.message.includes('already registered')
                        ? 'El email ya está registrado en el sistema'
                        : 'Error al crear usuario: ' + authError.message
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        if (!authData.user) {
            return new Response(
                JSON.stringify({ error: 'Error al crear usuario autenticado' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // Wait a bit for the trigger to create the users record
        await new Promise(resolve => setTimeout(resolve, 500))

        // Step 2: Create trainer record with user_id
        const { data: trainerData, error: trainerError } = await supabaseAdmin
            .from('trainers')
            .insert([
                {
                    name,
                    email,
                    phone,
                    specialty,
                    qr_code: 'temp',
                    branch_id,
                    user_id: authData.user.id,
                    active: true
                }
            ])
            .select('*, branches(name)')
            .single()

        if (trainerError) {
            console.error('Error creating trainer:', trainerError)

            // Rollback: delete the auth user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

            return new Response(
                JSON.stringify({ error: 'Error al crear entrenador: ' + trainerError.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // Step 3: Update QR code with unique short code
        const shortCode = `TR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        const { data: updatedTrainer, error: updateError } = await supabaseAdmin
            .from('trainers')
            .update({ qr_code: shortCode })
            .eq('id', trainerData.id)
            .select('*, branches(name)')
            .single()

        if (updateError) {
            console.error('Error updating QR code:', updateError)
            // Continue anyway, trainer was created successfully
        }

        return new Response(
            JSON.stringify({
                success: true,
                trainer: updatedTrainer || trainerData,
                message: 'Entrenador creado exitosamente. Debe cambiar su contraseña en el primer inicio de sesión.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Error inesperado al crear entrenador' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
