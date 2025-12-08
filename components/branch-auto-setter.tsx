'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useBranch } from '@/lib/contexts/branch-context';

/**
 * Component to auto-set branch for trainers and students
 * This must be a child of both AuthProvider and BranchProvider
 */
export function BranchAutoSetter() {
    const { user } = useAuth();
    const { setSelectedBranch } = useBranch();

    useEffect(() => {
        if (user && user.branches && (user.role === 'trainer' || user.role === 'student')) {
            console.log('🏢 Auto-setting branch for', user.role, ':', user.branches.name);
            setSelectedBranch(user.branches);
        }
    }, [user, setSelectedBranch]);

    return null; // This component doesn't render anything
}
