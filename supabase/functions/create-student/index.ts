import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateStudentRequest {
    name: string
    email: string
    phone?: string
    membership_status: string
    branch_id: string
    plan_id?: string
    trainer_id?: string
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
                JSON.stringify({ error: 'No tienes permisos para crear alumnos' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        // Parse request body
        const {
            name,
            email,
            phone,
            membership_status,
            branch_id,
            plan_id,
            trainer_id,
            password
        }: CreateStudentRequest = await req.json()

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

        // Step 0: Check if student already exists in public.students table
        const { data: existingStudent, error: checkError } = await supabaseAdmin
            .from('students')
            .filter('email', 'eq', email)
            .maybeSingle()

        if (existingStudent) {
            return new Response(
                JSON.stringify({ error: 'Ya existe un alumno registrado con este correo electrónico' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        let userId: string;

        // Step 1: Create user in auth.users with metadata
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: name,
                role: 'student',
                password_change_required: true,
                branch_id: branch_id
            }
        })

        if (authError) {
            // If user already exists, check if they have a profile in public.users but NO student record
            if (authError.message.includes('already registered')) {
                console.log('User already registered in Auth, checking for profile...')

                // Get the existing user by email
                const { data: { users: foundUsers }, error: findError } = await supabaseAdmin.auth.admin.listUsers()
                const existingAuthUser = foundUsers?.find(u => u.email === email)

                if (findError || !existingAuthUser) {
                    return new Response(
                        JSON.stringify({ error: 'El email ya está registrado, pero no se pudo obtener la información del usuario' }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                    )
                }

                userId = existingAuthUser.id;

                // Check their role in public.users
                const { data: existingProfile } = await supabaseAdmin
                    .from('users')
                    .select('role')
                    .eq('id', userId)
                    .maybeSingle()

                if (existingProfile && existingProfile.role !== 'student') {
                    return new Response(
                        JSON.stringify({ error: `El email ya está registrado como ${existingProfile.role}. No se puede crear como alumno.` }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                    )
                }

                // If we are here, we have an existing auth user (likely with a user profile as 'student' or no profile yet)
                // but definitely no 'student' record (checked in Step 0)
                console.log('Vincular a usuario existente:', userId)

                // Update profile if it exists to ensure correct metadata/role
                await supabaseAdmin
                    .from('users')
                    .upsert({
                        id: userId,
                        email,
                        full_name: name,
                        role: 'student',
                        branch_id: branch_id,
                        active: true
                    })

            } else {
                console.error('Error creating auth user:', authError)
                return new Response(
                    JSON.stringify({ error: 'Error al crear usuario: ' + authError.message }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                )
            }
        } else {
            if (!authData.user) {
                return new Response(
                    JSON.stringify({ error: 'Error al crear usuario autenticado' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
                )
            }
            userId = authData.user.id;
            // Wait a bit for the trigger to create the users record
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Step 2: Create student record with user_id
        const { data: studentData, error: studentError } = await supabaseAdmin
            .from('students')
            .insert([
                {
                    name,
                    email,
                    phone,
                    membership_status,
                    branch_id,
                    plan_id: plan_id || null,
                    trainer_id: trainer_id || null,
                    user_id: userId
                }
            ])
            .select('*, branches(name), plans(id, name), trainers(id, name)')
            .single()

        if (studentError) {
            console.error('Error creating student:', studentError)

            // Rollback ONLY if we created the user just now
            if (!authError) {
                await supabaseAdmin.auth.admin.deleteUser(userId)
            }

            return new Response(
                JSON.stringify({ error: 'Error al crear registro de alumno: ' + studentError.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                student: studentData,
                message: 'Alumno creado exitosamente. Debe cambiar su contraseña en el primer inicio de sesión.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Error inesperado al crear alumno' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
