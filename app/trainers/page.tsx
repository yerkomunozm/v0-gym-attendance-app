import { createClient } from "@/lib/supabase/server";
import { TrainersClient } from "@/components/trainers-client";
import { RoleBasedNav } from "@/components/role-based-nav";
import { redirect } from "next/navigation";

export default async function TrainersPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get user profile with role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, branch_id')
    .eq('id', session.user.id)
    .single();

  if (!userProfile) {
    redirect('/login');
  }

  // Build query based on role
  let query = supabase
    .from("trainers")
    .select("*, branches(name)");

  // Filter based on role
  if (userProfile.role === 'trainer' && userProfile.branch_id) {
    // Trainers can only see trainers from their branch
    query = query.eq('branch_id', userProfile.branch_id);
  }
  // Admin sees all trainers (no filter)
  // Students shouldn't access this page (middleware will handle)

  const { data: trainers, error } = await query.order("name");

  if (error) {
    console.error("Error fetching trainers:", error);
  }

  return (
    <>
      <RoleBasedNav />
      <TrainersClient initialTrainers={trainers || []} />
    </>
  );
}
