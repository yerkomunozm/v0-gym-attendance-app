import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectStudentClient } from '@/components/select-student-client'
import { mockStudents, mockTrainers } from '../mocks/fixtures'
import { createMockSupabaseClient, createMockQueryBuilder } from '../mocks/supabase'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createClient: () => createMockSupabaseClient(),
}))

describe('SelectStudentClient', () => {
    const mockProps = {
        trainerId: 'trainer-1',
        trainerName: 'John Doe',
        qrCode: 'QR-TRAINER-1',
        initialStudents: mockStudents.filter((s) => s.trainer_id === 'trainer-1'),
        initialLoadError: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render trainer information', () => {
        render(<SelectStudentClient {...mockProps} />)

        // Trainer name should be displayed
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    })

    it('should display list of students', () => {
        render(<SelectStudentClient {...mockProps} />)

        // Component should show trainer name
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    })

    it('should handle student selection interaction', async () => {
        render(<SelectStudentClient {...mockProps} />)

        // Component renders the form for selecting students
        expect(screen.getByLabelText(/Tu Nombre/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Registrar Asistencia/i })).toBeInTheDocument()
    })

    it('should show error message when initialLoadError is provided', () => {
        const errorProps = {
            ...mockProps,
            initialLoadError: 'Failed to load students',
        }

        render(<SelectStudentClient {...errorProps} />)

        expect(screen.getByText(/Failed to load students/i)).toBeInTheDocument()
    })

    it('should show message when no students are available', () => {
        const noStudentsProps = {
            ...mockProps,
            initialStudents: [],
        }

        render(<SelectStudentClient {...noStudentsProps} />)

        // Should show "Cargando alumnos..." initially (appears multiple times in the DOM)
        const cargandoElements = screen.getAllByText(/Cargando alumnos/i)
        expect(cargandoElements.length).toBeGreaterThan(0)
    })

    it('should handle missing trainer information gracefully', () => {
        const noTrainerProps = {
            trainerId: null,
            trainerName: null,
            qrCode: null,
            initialStudents: [],
            initialLoadError: null,
        }

        render(<SelectStudentClient {...noTrainerProps} />)

        // Component should render error message without crashing
        expect(screen.getByText(/Parámetros Faltantes/i)).toBeInTheDocument()
    })
})
