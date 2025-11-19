"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trainer } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Download, ArrowLeft, Search } from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

interface TrainersClientProps {
  initialTrainers: Trainer[];
}

export function TrainersClient({ initialTrainers }: TrainersClientProps) {
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTrainer, setNewTrainer] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });

  const supabase = createClient();

  const filteredTrainers = trainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("trainers")
      .insert([
        {
          ...newTrainer,
          qr_code: "temp",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding trainer:", error);
      alert("Error al agregar entrenador");
      return;
    }

    if (data) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const qrUrl = `${baseUrl}/scan/register?trainerId=${data.id}&trainerName=${encodeURIComponent(data.name)}`;
      
      const { data: updatedData, error: updateError } = await supabase
        .from("trainers")
        .update({ qr_code: qrUrl })
        .eq("id", data.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating QR code:", updateError);
      }

      setTrainers([...trainers, updatedData || data]);
      setNewTrainer({ name: "", email: "", phone: "", specialty: "" });
      setIsAdding(false);
    }
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
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-slate-900">Gestión de Entrenadores</h1>
            </div>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Entrenador
            </Button>
          </div>

          {isAdding && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Nuevo Entrenador</CardTitle>
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
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Guardar</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAdding(false)}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteTrainer(trainer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-4 rounded-lg border">
                      <QRCodeSVG
                        id={`qr-${trainer.id}`}
                        value={trainer.qr_code}
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
