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
  branch_id?: string; // Added branch_id for multi-branch support
}
