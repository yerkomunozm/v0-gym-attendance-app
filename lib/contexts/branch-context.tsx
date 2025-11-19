'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
}

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Load selected branch from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedBranch');
    if (saved) {
      try {
        setSelectedBranchState(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading selected branch:', e);
      }
    }
  }, []);

  const setSelectedBranch = (branch: Branch | null) => {
    setSelectedBranchState(branch);
    if (branch) {
      localStorage.setItem('selectedBranch', JSON.stringify(branch));
    } else {
      localStorage.removeItem('selectedBranch');
    }
  };

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch, branches, setBranches }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
