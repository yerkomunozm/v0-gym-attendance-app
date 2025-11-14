"use client";

import { Suspense } from "react";
import { SelectStudentClient } from "@/components/select-student-client";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SelectStudentClient />
    </Suspense>
  );
}
