import { createClient } from "@/lib/supabase/server";
import { TrainersClient } from "@/components/trainers-client";

export default async function TrainersPage() {
  const supabase = await createClient();

  const { data: trainers, error } = await supabase
    .from("trainers")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching trainers:", error);
  }

  return <TrainersClient initialTrainers={trainers || []} />;
}
