'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, QrCode, History, GraduationCap, Building2 } from 'lucide-react';
import { useBranch } from "@/lib/contexts/branch-context";

export default function Home() {
  const { selectedBranch } = useBranch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-slate-900">
              Control de Asistencias
            </h1>
            <p className="text-xl text-slate-600 mb-6">
              Gestiona alumnos y registra asistencias con códigos QR
            </p>
            
            {selectedBranch ? (
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Sede: {selectedBranch.name}</span>
                <Link href="/branches" className="ml-2 text-sm underline hover:text-blue-800">
                  Cambiar
                </Link>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-200 animate-pulse">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">No hay sede seleccionada</span>
                <Link href="/branches" className="ml-2 text-sm underline hover:text-orange-800">
                  Seleccionar
                </Link>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Entrenadores</CardTitle>
                <CardDescription>
                  Administra la lista de entrenadores y genera códigos QR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/trainers">
                  <Button className="w-full" disabled={!selectedBranch}>
                    Gestionar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Alumnos</CardTitle>
                <CardDescription>
                  Gestiona el registro de alumnos del gimnasio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/students">
                  <Button className="w-full" disabled={!selectedBranch}>
                    Gestionar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Registro de Asistencia</CardTitle>
                <CardDescription>
                  Los alumnos registran su asistencia escaneando el QR del entrenador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/scan">
                  <Button className="w-full" variant="default" disabled={!selectedBranch}>
                    Registrar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Historial</CardTitle>
                <CardDescription>
                  Consulta el historial de asistencias registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/history">
                  <Button className="w-full" variant="outline" disabled={!selectedBranch}>
                    Ver
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/branches">
              <Button variant="ghost" className="text-slate-500 hover:text-slate-700">
                <Building2 className="w-4 h-4 mr-2" />
                Gestionar Sedes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
