import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, QrCode, History, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-slate-900">
              Sistema de Asistencias
            </h1>
            <p className="text-xl text-slate-600">
              Gestiona entrenadores y registra asistencias con códigos QR
            </p>
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
                  <Button className="w-full">Gestionar</Button>
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
                  <Button className="w-full">Gestionar</Button>
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
                  <Button className="w-full" variant="default">Registrar</Button>
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
                  <Button className="w-full" variant="outline">Ver</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
