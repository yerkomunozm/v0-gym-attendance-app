import { SelectStudentClient } from "@/components/select-student-client";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface SearchParams {
  trainerId?: string;
  trainerName?: string;
  qrCode?: string;
}

interface RegisterPageProps {
  searchParams: Promise<SearchParams> | SearchParams;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams;

  const trainerId =
    typeof resolvedSearchParams.trainerId === "string"
      ? resolvedSearchParams.trainerId
      : null;

  const trainerName =
    typeof resolvedSearchParams.trainerName === "string"
      ? resolvedSearchParams.trainerName
      : null;

  const qrCode =
    typeof resolvedSearchParams.qrCode === "string"
      ? resolvedSearchParams.qrCode
      : null;

  if (!trainerId || !trainerName) {
    redirect("/");
  }

  const supabase = await createServerClient();
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("trainer_id", trainerId)
    .eq("membership_status", "active")
    .order("name");

  return (
    <SelectStudentClient
      trainerId={trainerId}
      trainerName={trainerName}
      qrCode={qrCode}
      initialStudents={students || []}
      initialLoadError={error ? error.message : null}
    />
  );
}
