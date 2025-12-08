'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    supabaseUser: SupabaseUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isTrainer: boolean;
    isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setSupabaseUser(session.user);
                    await fetchUserProfile(session.user.id);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setSupabaseUser(session.user);
                    await fetchUserProfile(session.user.id);
                } else {
                    setSupabaseUser(null);
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            console.log('🔍 Fetching user profile for ID:', userId);

            const { data, error } = await supabase
                .from('users')
                .select(`
          *,
          branches (
            id,
            name,
            address,
            phone,
            active,
            created_at
          )
        `)
                .eq('id', userId)
                .single();

            if (error) {
                console.error('❌ Error fetching user profile:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });

                // Si el error es que no se encontró el usuario
                if (error.code === 'PGRST116') {
                    console.error('⚠️ Usuario no encontrado en tabla users. El usuario existe en auth.users pero no tiene perfil en public.users');
                    console.error('💡 Solución: Ejecuta el script scripts/fix_missing_users.sql en Supabase SQL Editor');
                }

                return;
            }

            console.log('✅ User profile loaded:', { email: data.email, role: data.role });
            setUser(data);

            // Auto-set branch for trainers and students
            if (data.branches && (data.role === 'trainer' || data.role === 'student')) {
                console.log('🏢 Auto-setting branch for', data.role, ':', data.branches.name);
                // We need to use the branch context here, but we can't call useBranch in this function
                // So we'll set it in a useEffect instead
            }
        } catch (error) {
            console.error('❌ Exception fetching user profile:', error);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error };
            }

            if (data.user) {
                setSupabaseUser(data.user);
                await fetchUserProfile(data.user.id);
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setSupabaseUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const isAdmin = user?.role === 'admin';
    const isTrainer = user?.role === 'trainer';
    const isStudent = user?.role === 'student';

    return (
        <AuthContext.Provider
            value={{
                user,
                supabaseUser,
                loading,
                signIn,
                signOut,
                isAdmin,
                isTrainer,
                isStudent,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
