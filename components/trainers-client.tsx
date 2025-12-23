"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trainer } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Download, ArrowLeft, Search, Building2, Pencil } from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useBranch } from "@/lib/contexts/branch-context";

interface TrainersClientProps {
  initialTrainers: Trainer[];
}

export function TrainersClient({ initialTrainers }: TrainersClientProps) {
  const { selectedBranch } = useBranch();
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTrainer, setNewTrainer] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    password: "",
  });

  const supabase = createClient();

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = !selectedBranch || trainer.branch_id === selectedBranch.id;
    return matchesSearch && matchesBranch;
  });

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBranch) {
      alert('Debes seleccionar una sede primero');
      return;
    }

    if (editingTrainer) {
      // Update existing trainer
      const { data, error } = await supabase
        .from("trainers")
        .update({
          name: newTrainer.name,
          email: newTrainer.email,
          phone: newTrainer.phone,
          specialty: newTrainer.specialty
        })
        .eq("id", editingTrainer.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating trainer:", error);
        alert("Error al actualizar entrenador");
        return;
      }

      if (data) {
        setTrainers(trainers.map(t => t.id === data.id ? data : t));
        setNewTrainer({ name: "", email: "", phone: "", specialty: "", password: "" });
        setEditingTrainer(null);
        setIsAdding(false);
      }
    } else {
      // Create new trainer using Edge Function
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        alert('No estás autenticado');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-trainer`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({
              name: newTrainer.name,
              email: newTrainer.email,
              phone: newTrainer.phone,
              specialty: newTrainer.specialty,
              branch_id: selectedBranch.id,
              password: newTrainer.password,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al crear entrenador');
        }

        setTrainers([...trainers, result.trainer]);
        setNewTrainer({ name: "", email: "", phone: "", specialty: "", password: "" });
        setIsAdding(false);
        alert(result.message || 'Entrenador creado exitosamente');
      } catch (error) {
        console.error("Error creating trainer:", error);
        alert(error instanceof Error ? error.message : "Error al agregar entrenador");
      }
    }
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setNewTrainer({
      name: trainer.name,
      email: trainer.email || "",
      phone: trainer.phone || "",
      specialty: trainer.specialty || "",
      password: "" // Password not editable
    });
    setIsAdding(true);
  };

  const handleCancelEdit = () => {
    setEditingTrainer(null);
    setNewTrainer({ name: "", email: "", phone: "", specialty: "", password: "" });
    setIsAdding(false);
  };

  const handleDeleteTrainer = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este entrenador?")) return;

    const { error } = await supabase.from("trainers").delete().eq("id", id);

    if (error) {
      console.error("Error deleting trainer:", error);
      alert("Error al eliminar entrenador");
      return;
    }

    setTrainers(trainers.filter((t) => t.id !== id));
  };

  const downloadQRCode = (trainer: Trainer) => {
    const svg = document.getElementById(`qr-${trainer.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${trainer.name.replace(/\s+/g, "-")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                </Link>
                {selectedBranch ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Building2 className="w-3 h-3" />
                    {selectedBranch.name}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    <Building2 className="w-3 h-3" />
                    Sin sucursal seleccionada
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold text-slate-900">Gestión de Entrenadores</h1>
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={!selectedBranch}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Entrenador
            </Button>
          </div>

          {!selectedBranch && isAdding && (
            <Card className="mb-8 bg-orange-50 border-orange-200">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Sede no seleccionada</h3>
                    <p className="text-orange-700">Debes seleccionar una sede para agregar entrenadores</p>
                  </div>
                </div>
                <Link href="/branches">
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                    Seleccionar Sede
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isAdding && selectedBranch && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingTrainer ? 'Editar Entrenador' : 'Nuevo Entrenador'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTrainer} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        required
                        value={newTrainer.name}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newTrainer.email}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={newTrainer.phone}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Especialidad</Label>
                      <Input
                        id="specialty"
                        value={newTrainer.specialty}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, specialty: e.target.value })
                        }
                      />
                    </div>
                    {!editingTrainer && (
                      <div>
                        <Label htmlFor="password">Contraseña Inicial *</Label>
                        <Input
                          id="password"
                          type="password"
                          required={!editingTrainer}
                          value={newTrainer.password}
                          onChange={(e) =>
                            setNewTrainer({ ...newTrainer, password: e.target.value })
                          }
                          placeholder="Mínimo 6 caracteres"
                          minLength={6}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          El entrenador deberá cambiar esta contraseña en su primer inicio de sesión
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingTrainer ? 'Actualizar' : 'Guardar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar entrenador por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-slate-600 mt-2">
                Mostrando {filteredTrainers.length} de {trainers.length} entrenadores
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <Card key={trainer.id} className="relative">
                <CardHeader>
                  <CardTitle className="text-lg">{trainer.name}</CardTitle>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditTrainer(trainer)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteTrainer(trainer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {trainer.email && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Email:</span> {trainer.email}
                      </p>
                    )}
                    {trainer.phone && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Teléfono:</span> {trainer.phone}
                      </p>
                    )}
                    {trainer.specialty && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Especialidad:</span>{" "}
                        {trainer.specialty}
                      </p>
                    )}
                    {trainer.branches && (
                      <p className="text-sm text-blue-600 flex items-center gap-1 mt-2">
                        <Building2 className="w-3 h-3" />
                        <span className="font-medium">Sede:</span> {trainer.branches.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-4 rounded-lg border">
                      <QRCodeSVG
                        id={`qr-${trainer.id}`}
                        value={
                          trainer.qr_code.startsWith('http')
                            ? trainer.qr_code
                            : `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/scan/register?trainerId=${trainer.id}&trainerName=${encodeURIComponent(trainer.name)}`
                        }
                        size={150}
                      />
                    </div>
                    <p className="text-xs text-center text-slate-500 px-2">
                      Escanea este QR con la cámara del teléfono para registrar asistencia
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQRCode(trainer)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar QR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTrainers.length === 0 && !isAdding && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">
                {searchQuery
                  ? "No se encontraron entrenadores con ese nombre."
                  : "No hay entrenadores registrados. Agrega uno para comenzar."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
