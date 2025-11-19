"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Attendance } from "@/lib/types";
import { ArrowLeft, X } from 'lucide-react';
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranch } from "@/lib/contexts/branch-context";

interface HistoryClientProps {
  initialAttendance: Attendance[];
}

export function HistoryClient({ initialAttendance }: HistoryClientProps) {
  const { selectedBranch } = useBranch();
  const [attendance] = useState<Attendance[]>(initialAttendance);
  const [dateFilter, setDateFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const uniqueStudents = useMemo(() => {
    const students = new Set(attendance.map(record => record.student_name).filter(Boolean));
    return Array.from(students).sort();
  }, [attendance]);

  const uniqueTrainers = useMemo(() => {
    const trainers = new Set(attendance.map(record => record.trainers?.name).filter(Boolean));
    return Array.from(trainers).sort();
  }, [attendance]);

  const uniqueBranches = useMemo(() => {
    const branches = new Set(attendance.map(record => record.students?.branches?.name).filter(Boolean));
    return Array.from(branches).sort();
  }, [attendance]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(attendance.map(record => {
      const date = new Date(record.check_in_time);
      return date.toLocaleDateString("es-ES");
    }));
    return Array.from(dates).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });
  }, [attendance]);

  const filteredAttendance = attendance.filter((record) => {
    const recordDate = new Date(record.check_in_time).toLocaleDateString("es-ES");
    const studentName = record.student_name || "";
    const trainerName = record.trainers?.name || "";
    const branchName = record.students?.branches?.name || "";

    // Global branch filter
    if (selectedBranch && record.students?.branch_id !== selectedBranch.id) {
      return false;
    }

    const matchesDate = !dateFilter || dateFilter === "__all__" || recordDate === dateFilter;
    const matchesStudent = !studentFilter || studentFilter === "__all__" || studentName === studentFilter;
    const matchesTrainer = !trainerFilter || trainerFilter === "__all__" || trainerName === trainerFilter;
    const matchesBranch = !branchFilter || branchFilter === "__all__" || branchName === branchFilter;

    return matchesDate && matchesStudent && matchesTrainer && matchesBranch;
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setDateFilter("");
    setStudentFilter("");
    setTrainerFilter("");
    setBranchFilter("");
  };

  const hasActiveFilters = dateFilter || studentFilter || trainerFilter || branchFilter;

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

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">
              Historial de Asistencias
            </h1>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Filtrar por Fecha
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las fechas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas las fechas</SelectItem>
                      {uniqueDates.map((date) => (
                        <SelectItem key={date} value={date}>
                          {date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!selectedBranch && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Filtrar por Sede
                    </label>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las sedes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas las sedes</SelectItem>
                        {uniqueBranches.map((branch) => (
                          <SelectItem key={branch as string} value={branch as string}>
                            {branch as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Filtrar por Alumno
                  </label>
                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los alumnos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todos los alumnos</SelectItem>
                      {uniqueStudents.map((student) => (
                        <SelectItem key={student} value={student}>
                          {student}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Filtrar por Entrenador
                  </label>
                  <Select value={trainerFilter} onValueChange={setTrainerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los entrenadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todos los entrenadores</SelectItem>
                      {uniqueTrainers.map((trainer) => (
                        <SelectItem key={trainer} value={trainer}>
                          {trainer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="self-start"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Registros de Asistencia
                {hasActiveFilters && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    ({filteredAttendance.length} resultado{filteredAttendance.length !== 1 ? 's' : ''})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAttendance.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500 text-lg">
                    {hasActiveFilters
                      ? "No se encontraron registros con los filtros seleccionados."
                      : "No hay registros de asistencia todavía."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        {!selectedBranch && <TableHead>Sede</TableHead>}
                        <TableHead>Alumno</TableHead>
                        <TableHead>Entrenador</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {formatDateTime(record.check_in_time)}
                          </TableCell>
                          {!selectedBranch && (
                            <TableCell>
                              {record.students?.branches?.name || "-"}
                            </TableCell>
                          )}
                          <TableCell>{record.student_name}</TableCell>
                          <TableCell>
                            {record.trainers?.name || "Entrenador desconocido"}
                          </TableCell>
                          <TableCell>
                            {record.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
