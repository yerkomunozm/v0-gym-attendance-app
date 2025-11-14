"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, Scan } from 'lucide-react';
import Link from "next/link";

export function ScanClient() {
  const [studentName, setStudentName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      // First, check if the trainer exists
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

      const { error: attendanceError } = await supabase
        .from("attendance")
        .insert([
          {
            trainer_id: trainer.id,
            student_name: studentName,
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
        message: `Asistencia de ${studentName} registrada con ${trainer.name}`,
      });
      setStudentName("");
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
                    Ingresa tu nombre y escanea el código QR de tu entrenador
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="student-name">Nombre del Alumno *</Label>
                  <Input
                    id="student-name"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ingresa tu nombre completo"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Tu nombre será registrado en la asistencia
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
