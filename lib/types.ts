export interface Trainer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  qr_code: string;
  active: boolean;
  created_at: string;
  branch_id?: string; // Added branch_id for multi-branch support
  branches?: {
    name: string;
  } | null; // Added branches relation for display
}

export interface Attendance {
  id: string;
  trainer_id: string;
  student_name: string;
  student_id?: string | null;
  check_in_time: string;
  notes: string | null;
  created_at: string;
  branch_id?: string; // Added branch_id for multi-branch support
  trainers?: Trainer;
  students?: Student;
}

export interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  membership_status: string;
  registration_date: string;
  created_at: string;
  branch_id?: string;
  branches?: {
    name: string;
  } | null;
  plan_id?: string;
  plans?: Plan | null;
}

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  created_at: string;
}

export type UserRole = 'admin' | 'trainer' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  branch_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  branches?: Branch | null;
}
