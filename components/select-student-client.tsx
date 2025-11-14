"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, UserCircle } from 'lucide-react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import type { Student } from "@/lib/types";

export function SelectStudentClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const trainerId = searchParams.get("trainerId");
  const trainerName = searchParams.get("trainerName");
  
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!trainerId || !trainerName) {
      router.push("/");
      return;
    }

    async function loadStudents() {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("membership_status", "active")
        .order("name");

      if (error) {
        console.error("Error loading students:", error);
      }

      if (!error && data) {
        setStudents(data);
      }
      setIsLoadingStudents(false);
    }

    loadStudents();
  }, [trainerId, trainerName, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const supabase = createClient();
      const selectedStudent = students.find((s) => s.id === studentId);

      const { error: attendanceError } = await supabase
        .from("attendance")
        .insert([
          {
            trainer_id: trainerId,
            student_id: studentId,
            student_name: selectedStudent?.name || "",
            notes: notes || null,
          },
        ]);

      if (attendanceError) {
        setStatus({
          type: "error",
          message: "Error al registrar asistencia. Intenta nuevamente.",
        });
        setIsSubmitting(false);
        return;
      }

      setStatus({
        type: "success",
        message: `Asistencia de ${selectedStudent?.name} registrada con ${trainerName}`,
      });
      
      // Clear form after success
      setStudentId("");
      setNotes("");
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setStatus({
        type: "error",
        message: "Error inesperado al registrar asistencia.",
      });
      setIsSubmitting(false);
    }
  };

  if (!trainerId || !trainerName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Registrar Asistencia</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Selecciona tu nombre para registrar asistencia
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 font-medium">
                    Entrenador: {trainerName}
                  </p>
                </div>

                <div>
                  <Label htmlFor="student">Tu Nombre *</Label>
                  <Select
                    value={studentId}
                    onValueChange={setStudentId}
                    disabled={isLoadingStudents}
                    required
                  >
                    <SelectTrigger id="student">
                      <SelectValue
                        placeholder={
                          isLoadingStudents
                            ? "Cargando alumnos..."
                            : students.length === 0
                            ? "No hay alumnos registrados"
                            : "Selecciona tu nombre"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                          {student.email && (
                            <span className="text-slate-500 text-xs ml-2">
                              ({student.email})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    {isLoadingStudents
                      ? "Cargando alumnos..."
                      : students.length === 0
                      ? "No hay alumnos registrados. Contacta al administrador."
                      : `${students.length} alumno(s) disponible(s)`}
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agrega notas adicionales sobre tu clase..."
                    rows={3}
                  />
                </div>

                {status.type && (
                  <div
                    className={`flex items-center gap-2 p-4 rounded-lg ${
                      status.type === "success"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <p className="text-sm font-medium">{status.message}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingStudents}>
                  {isSubmitting ? "Registrando..." : "Registrar Asistencia"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
