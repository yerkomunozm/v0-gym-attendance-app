import { createServerClient } from '@/lib/supabase/server';
import StudentsClient from '@/components/students-client';

export default async function StudentsPage() {
  const supabase = await createServerClient();
  
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*, branches(name), plans(id, name)')
    .order('name', { ascending: true });

  if (studentsError) {
    console.error('Error fetching students:', studentsError);
  }

  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (plansError) {
    console.error('Error fetching plans:', plansError);
  }

  return <StudentsClient initialStudents={students || []} availablePlans={plans || []} />;
}
