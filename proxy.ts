import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Routes that don't require authentication
const publicRoutes = ['/login'];

// Routes that require specific roles
const roleRoutes = {
    admin: ['/admin', '/branches', '/plans'],
    trainer: ['/trainers', '/students', '/history'],
    student: ['/student'],
};

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        // Redirect to login if not authenticated
        if (!session) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Get user profile with role
        const { data: user } = await supabase
            .from('users')
            .select('role, active')
            .eq('id', session.user.id)
            .single();

        console.log('🔐 User check:', {
            userId: session.user.id,
            email: session.user.email,
            userFound: !!user,
            active: user?.active,
            role: user?.role
        });

        // Check if user is active
        if (!user || !user.active) {
            console.error('❌ User is inactive or not found:', {
                userExists: !!user,
                active: user?.active
            });
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'inactive');
            return NextResponse.redirect(loginUrl);
        }

        // Check role-based access
        const userRole = user.role as 'admin' | 'trainer' | 'student';

        // Admin has access to everything
        if (userRole === 'admin') {
            return NextResponse.next();
        }

        // Check if the route requires a specific role
        for (const [requiredRole, routes] of Object.entries(roleRoutes)) {
            if (routes.some(route => pathname.startsWith(route))) {
                // If user doesn't have the required role, redirect
                if (userRole !== requiredRole) {
                    // Redirect to appropriate dashboard based on user's role
                    const dashboardUrl = new URL('/', request.url);
                    return NextResponse.redirect(dashboardUrl);
                }
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        // On error, redirect to login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public directory)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
