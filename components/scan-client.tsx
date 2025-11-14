"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, CheckCircle, XCircle, Scan } from 'lucide-react';
import Link from "next/link";
import type { Student } from "@/lib/types";

export function ScanClient() {
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      console.log("[v0] Loading students...");
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("membership_status", "active")
        .order("name");

      console.log("[v0] Students query result:", { data, error, count: data?.length });

      if (error) {
        console.error("[v0] Error loading students:", error);
      }

      if (!error && data) {
        setStudents(data);
      }
      setIsLoadingStudents(false);
    }

    loadStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const supabase = createClient();
      
      const { data: trainer, error: trainerError } = await supabase
        .from("trainers")
        .select("*")
        .eq("qr_code", qrCode)
        .single();

      if (trainerError || !trainer) {
        setStatus({
          type: "error",
          message: "Código QR no válido. Entrenador no encontrado.",
        });
        setIsSubmitting(false);
        return;
      }

      const selectedStudent = students.find((s) => s.id === studentId);

      const { error: attendanceError } = await supabase
        .from("attendance")
        .insert([
          {
            trainer_id: trainer.id,
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
        message: `Asistencia de ${selectedStudent?.name} registrada con ${trainer.name}`,
      });
      setStudentId("");
      setQrCode("");
      setNotes("");
    } catch (error) {
      console.error("Error:", error);
      setStatus({
        type: "error",
        message: "Error inesperado al registrar asistencia.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Scan className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Registro de Asistencia</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Selecciona tu nombre y escanea el código QR de tu entrenador
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="student">Nombre del Alumno *</Label>
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
                      ? "No hay alumnos registrados. Ve a la sección de Alumnos para agregar uno."
                      : `${students.length} alumno(s) disponible(s)`}
                  </p>
                </div>

                <div>
                  <Label htmlFor="qr-code">Código QR del Entrenador *</Label>
                  <Input
                    id="qr-code"
                    required
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Ej: TRAINER-1234567890-abc123"
                    className="font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Escanea el código QR de tu entrenador o ingresa el código manualmente
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agrega notas adicionales sobre la asistencia..."
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

                <Button type="submit" className="w-full" disabled={isSubmitting}>
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
