import type { Trainer, Student, Attendance, Branch, Plan, User } from '@/lib/types'

// Mock Branches
export const mockBranches: Branch[] = [
    {
        id: 'branch-1',
        name: 'Main Branch',
        address: '123 Main St, City',
        phone: '+1234567890',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'branch-2',
        name: 'West Branch',
        address: '456 West Ave, City',
        phone: '+1234567891',
        active: true,
        created_at: '2024-01-02T00:00:00Z',
    },
]

// Mock Plans
export const mockPlans: Plan[] = [
    {
        id: 'plan-1',
        name: 'Basic Plan',
        description: 'Access to gym facilities',
        price: 29.99,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'plan-2',
        name: 'Premium Plan',
        description: 'Full access with personal trainer',
        price: 59.99,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
]

// Mock Trainers
export const mockTrainers: Trainer[] = [
    {
        id: 'trainer-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        specialty: 'Strength Training',
        qr_code: 'QR-TRAINER-1',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        branch_id: 'branch-1',
        branches: {
            name: 'Main Branch',
        },
    },
    {
        id: 'trainer-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        specialty: 'Cardio',
        qr_code: 'QR-TRAINER-2',
        active: true,
        created_at: '2024-01-02T00:00:00Z',
        branch_id: 'branch-2',
        branches: {
            name: 'West Branch',
        },
    },
]

// Mock Students
export const mockStudents: Student[] = [
    {
        id: 'student-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1234567892',
        membership_status: 'active',
        registration_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        branch_id: 'branch-1',
        branches: {
            name: 'Main Branch',
        },
        plan_id: 'plan-1',
        plans: mockPlans[0],
        trainer_id: 'trainer-1',
        trainers: mockTrainers[0],
    },
    {
        id: 'student-2',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '+1234567893',
        membership_status: 'active',
        registration_date: '2024-01-05',
        created_at: '2024-01-05T00:00:00Z',
        branch_id: 'branch-1',
        branches: {
            name: 'Main Branch',
        },
        plan_id: 'plan-2',
        plans: mockPlans[1],
        trainer_id: 'trainer-1',
        trainers: mockTrainers[0],
    },
    {
        id: 'student-3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '+1234567894',
        membership_status: 'inactive',
        registration_date: '2023-12-01',
        created_at: '2023-12-01T00:00:00Z',
        branch_id: 'branch-2',
        branches: {
            name: 'West Branch',
        },
        plan_id: 'plan-1',
        plans: mockPlans[0],
        trainer_id: 'trainer-2',
        trainers: mockTrainers[1],
    },
    {
        id: 'student-4',
        name: 'Diana Prince',
        email: 'diana@example.com',
        phone: '+1234567895',
        membership_status: 'inactive',
        registration_date: '2024-02-01',
        created_at: '2024-02-01T00:00:00Z',
        branch_id: 'branch-1',
        branches: {
            name: 'Main Branch',
        },
        plan_id: 'plan-1',
        plans: mockPlans[0],
        trainer_id: 'trainer-1',
        trainers: mockTrainers[0],
    },
]

// Mock Attendance
export const mockAttendance: Attendance[] = [
    {
        id: 'attendance-1',
        trainer_id: 'trainer-1',
        student_name: 'Alice Johnson',
        student_id: 'student-1',
        check_in_time: '2024-01-15T09:00:00Z',
        notes: 'Regular session',
        created_at: '2024-01-15T09:00:00Z',
        branch_id: 'branch-1',
        trainers: mockTrainers[0],
        students: mockStudents[0],
    },
    {
        id: 'attendance-2',
        trainer_id: 'trainer-1',
        student_name: 'Bob Wilson',
        student_id: 'student-2',
        check_in_time: '2024-01-15T10:00:00Z',
        notes: null,
        created_at: '2024-01-15T10:00:00Z',
        branch_id: 'branch-1',
        trainers: mockTrainers[0],
        students: mockStudents[1],
    },
]

// Mock Users
export const mockUsers: User[] = [
    {
        id: 'user-1',
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin',
        branch_id: null,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'user-2',
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'trainer',
        branch_id: 'branch-1',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        branches: mockBranches[0],
    },
    {
        id: 'user-3',
        email: 'alice@example.com',
        full_name: 'Alice Johnson',
        role: 'student',
        branch_id: 'branch-1',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        branches: mockBranches[0],
    },
]
