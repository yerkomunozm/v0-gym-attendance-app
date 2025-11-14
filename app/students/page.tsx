import { createServerClient } from '@/lib/supabase/server';
import StudentsClient from '@/components/students-client';

export default async function StudentsPage() {
  const supabase = await createServerClient();
  
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching students:', error);
  }

  return <StudentsClient initialStudents={students || []} />;
}
