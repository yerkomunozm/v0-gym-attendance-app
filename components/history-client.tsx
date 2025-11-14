"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Attendance } from "@/lib/types";
import { ArrowLeft, Calendar, Clock, User, FileText, UserCircle } from 'lucide-react';
import Link from "next/link";

interface HistoryClientProps {
  initialAttendance: Attendance[];
}

export function HistoryClient({ initialAttendance }: HistoryClientProps) {
  const [attendance] = useState<Attendance[]>(initialAttendance);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttendance = attendance.filter((record) => {
    const trainerName = record.trainers?.name || "";
    const studentName = record.student_name || "";
    const searchLower = searchTerm.toLowerCase();
    return (
      trainerName.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-4xl font-bold text-slate-900">
              Historial de Asistencias
            </h1>
            <Input
              placeholder="Buscar por alumno o entrenador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-xs"
            />
          </div>

          <div className="space-y-4">
            {filteredAttendance.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500 text-lg">
                    {searchTerm
                      ? "No se encontraron registros con ese criterio de búsqueda."
                      : "No hay registros de asistencia todavía."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAttendance.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <UserCircle className="w-5 h-5 text-green-600" />
                        {record.student_name}
                      </CardTitle>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {record.trainers?.name || "Entrenador desconocido"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">Fecha:</span>
                          <span className="text-slate-600">
                            {formatDate(record.check_in_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">Hora:</span>
                          <span className="text-slate-600">
                            {formatTime(record.check_in_time)}
                          </span>
                        </div>
                        {record.trainers?.specialty && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Especialidad:</span>
                            <span className="text-slate-600">
                              {record.trainers.specialty}
                            </span>
                          </div>
                        )}
                      </div>
                      {record.notes && (
                        <div className="md:col-span-2">
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Notas:</span>
                              <p className="text-slate-600 mt-1">{record.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
