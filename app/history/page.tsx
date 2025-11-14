import { createClient } from "@/lib/supabase/server";
import { HistoryClient } from "@/components/history-client";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("attendance")
    .select(
      `
      *,
      trainers (
        id,
        name,
        email,
        specialty
      )
    `
    )
    .order("check_in_time", { ascending: false });

  if (error) {
    console.error("Error fetching attendance:", error);
  }

  return <HistoryClient initialAttendance={attendance || []} />;
}
