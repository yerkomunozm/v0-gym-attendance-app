import { render, waitFor } from '@testing-library/react'
import { BranchAutoSetter } from '@/components/branch-auto-setter'
import { mockBranches, mockUsers } from '../mocks/fixtures'

// Mock contexts
const mockSetSelectedBranch = jest.fn()
const mockUseAuth = jest.fn()
const mockUseBranch = jest.fn()

jest.mock('@/lib/contexts/auth-context', () => ({
    useAuth: () => mockUseAuth(),
}))

jest.mock('@/lib/contexts/branch-context', () => ({
    useBranch: () => mockUseBranch(),
}))

describe('BranchAutoSetter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseBranch.mockReturnValue({
            setSelectedBranch: mockSetSelectedBranch,
        })
    })

    it('should auto-set branch for trainer with associated branch', () => {
        const trainerUser = {
            ...mockUsers[1], // John Doe (Trainer)
            role: 'trainer',
            branches: mockBranches[0], // Main Branch
        }

        mockUseAuth.mockReturnValue({
            user: trainerUser,
            loading: false,
        })

        render(<BranchAutoSetter />)

        expect(mockSetSelectedBranch).toHaveBeenCalledWith(mockBranches[0])
        expect(mockSetSelectedBranch).toHaveBeenCalledTimes(1)
    })

    it('should auto-set branch for student with associated branch', () => {
        const studentUser = {
            ...mockUsers[2], // Alice Johnson (Student)
            role: 'student',
            branches: mockBranches[0],
        }

        mockUseAuth.mockReturnValue({
            user: studentUser,
            loading: false,
        })

        render(<BranchAutoSetter />)

        expect(mockSetSelectedBranch).toHaveBeenCalledWith(mockBranches[0])
    })

    it('should NOT set branch for admin', () => {
        const adminUser = {
            ...mockUsers[0], // Admin User
            role: 'admin',
            branches: null,
        }

        mockUseAuth.mockReturnValue({
            user: adminUser,
            loading: false,
        })

        render(<BranchAutoSetter />)

        expect(mockSetSelectedBranch).not.toHaveBeenCalled()
    })

    it('should NOT set branch if user has no branch', () => {
        const trainerNoBranch = {
            ...mockUsers[1],
            role: 'trainer',
            branches: null,
        }

        mockUseAuth.mockReturnValue({
            user: trainerNoBranch,
            loading: false,
        })

        render(<BranchAutoSetter />)

        expect(mockSetSelectedBranch).not.toHaveBeenCalled()
    })
})
