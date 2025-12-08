import { createClient } from "@/lib/supabase/server";
import { HistoryClient } from "@/components/history-client";
import { RoleBasedNav } from "@/components/role-based-nav";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const supabase = await createClient();

  // Get current user - use getUser() for server-side authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user profile with role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, branch_id')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    redirect('/login');
  }

  // Build query based on role
  let query = supabase
    .from("attendance")
    .select(
      `
      *,
      trainers (
        id,
        name,
        email,
        specialty
      ),
      students (
        id,
        name,
        branch_id,
        branches (
          id,
          name
        )
      )
    `
    );

  // Filter based on role
  if (userProfile.role === 'trainer' && userProfile.branch_id) {
    // Trainers can only see attendance from their branch
    query = query.eq('branch_id', userProfile.branch_id);
  } else if (userProfile.role === 'student') {
    // Students can only see their own attendance
    const { data: studentRecord } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentRecord) {
      query = query.eq('student_id', studentRecord.id);
    } else {
      // If no student record found, return empty array
      return (
        <>
          <RoleBasedNav />
          <HistoryClient initialAttendance={[]} />
        </>
      );
    }
  }
  // Admin sees all attendance (no filter)

  const { data: attendance, error } = await query.order("check_in_time", { ascending: false });

  if (error) {
    console.error("Error fetching attendance:", error);
  }

  return (
    <>
      <RoleBasedNav />
      <HistoryClient initialAttendance={attendance || []} />
    </>
  );
}
