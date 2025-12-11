import { render, screen } from '@testing-library/react'
import StudentsClient from '@/components/students-client'
import { mockStudents, mockPlans, mockTrainers } from '../mocks/fixtures'
import { createMockSupabaseClient } from '../mocks/supabase'

// Mock Next. modules
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
    }),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createBrowserClient: () => createMockSupabaseClient(),
}))

// Mock the BranchContext
jest.mock('@/lib/contexts/branch-context', () => ({
    useBranch: () => ({
        selectedBranch: {
            id: 'branch-1',
            name: 'Main Branch',
        },
        setSelectedBranch: jest.fn(),
    }),
}))

describe('StudentsClient', () => {
    const mockProps = {
        initialStudents: mockStudents,
        availablePlans: mockPlans,
        availableTrainers: mockTrainers,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render students list', () => {
        render(<StudentsClient {...mockProps} />)

        // Should display student names
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
        expect(screen.getByText('Diana Prince')).toBeInTheDocument()
    })

    it('should display the page title', () => {
        render(<StudentsClient {...mockProps} />)

        expect(screen.getByText('Gestión de Alumnos')).toBeInTheDocument()
    })

    it('should display student details', () => {
        render(<StudentsClient {...mockProps} />)

        // Check for email and phone
        expect(screen.getByText('alice@example.com')).toBeInTheDocument()
        expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    it('should show branch information', () => {
        render(<StudentsClient {...mockProps} />)

        // Should show branch names in student cards
        // Should show branch names in student cards (appears multiple times)
        const branchElements = screen.getAllByText(/Main Branch/i)
        expect(branchElements.length).toBeGreaterThan(0)
    })

    it('should display membership status badges', () => {
        render(<StudentsClient {...mockProps} />)

        // Check for status indicators - use getAllByText since status appears multiple times
        const activoElements = screen.getAllByText('Activo')
        expect(activoElements.length).toBeGreaterThan(0)

        const inactivoElements = screen.getAllByText('Inactivo')
        expect(inactivoElements.length).toBeGreaterThan(0)
    })

    it('should show plan information', () => {
        render(<StudentsClient {...mockProps} />)

        // Should display plan names
        // Should display plan names
        const basicPlanElements = screen.getAllByText(/Basic Plan/i)
        expect(basicPlanElements.length).toBeGreaterThan(0)

        // Premium Plan might result in multiple matches or single match depending on data
        // Using getAllByText is safer if data changes
        const premiumPlanElements = screen.getAllByText(/Premium Plan/i)
        expect(premiumPlanElements.length).toBeGreaterThan(0)
    })

    it('should show add student button', () => {
        render(<StudentsClient {...mockProps} />)

        expect(screen.getByRole('button', { name: /Agregar Alumno/i })).toBeInTheDocument()
    })

    it('should render search input', () => {
        render(<StudentsClient {...mockProps} />)

        expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeInTheDocument()
    })
})
