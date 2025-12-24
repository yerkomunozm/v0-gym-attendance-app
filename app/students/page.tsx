import { createClient } from "@/lib/supabase/server";
import StudentsClient from "@/components/students-client";
import { RoleBasedNav } from "@/components/role-based-nav";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
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
    .from("students")
    .select(`
      *,
      branches(name),
      plans(name, price),
      trainers(id, name)
    `);

  // Filter based on role
  if (userProfile.role === 'trainer' && userProfile.branch_id) {
    // Trainers can only see students from their branch
    query = query.eq('branch_id', userProfile.branch_id);
  }
  // Admin sees all students (no filter)
  // Students shouldn't access this page (middleware will handle)

  const { data: students, error } = await query.order("name");

  if (error) {
    console.error("Error fetching students:", error);
  }

  // Fetch plans for the dropdown
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("name");


  // Fetch trainers for the dropdown
  let trainersQuery = supabase
    .from("trainers")
    .select("id, name, branch_id")
    .eq("active", true);

  // Filter trainers by branch for non-admin users
  if (userProfile.role === 'trainer' && userProfile.branch_id) {
    trainersQuery = trainersQuery.eq('branch_id', userProfile.branch_id);
  }

  const { data: trainers } = await trainersQuery.order("name");

  return (
    <>
      <RoleBasedNav />
      <StudentsClient
        initialStudents={students || []}
        availablePlans={plans || []}
        availableTrainers={trainers || []}
      />
    </>
  );
}
