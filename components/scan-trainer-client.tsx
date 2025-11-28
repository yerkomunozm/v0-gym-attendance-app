"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Scan, XCircle } from 'lucide-react';
import Link from "next/link";
import { useRouter } from 'next/navigation';

export function ScanTrainerClient() {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError("");

    try {
      const supabase = createClient();
      let trainerData;

      // Check if input is a URL
      if (qrCode.startsWith('http')) {
        try {
          const url = new URL(qrCode);
          const trainerId = url.searchParams.get('trainerId');

          if (trainerId) {
            const { data, error } = await supabase
              .from("trainers")
              .select("*")
              .eq("id", trainerId)
              .single();

            if (!error && data) {
              trainerData = data;
            }
          }
        } catch (e) {
          console.error("Invalid URL:", e);
        }
      }

      // If not found by URL or not a URL, try finding by qr_code field (for short codes or legacy full URLs)
      if (!trainerData) {
        const { data, error } = await supabase
          .from("trainers")
          .select("*")
          .eq("qr_code", qrCode)
          .single();

        if (!error && data) {
          trainerData = data;
        }
      }

      if (!trainerData) {
        setError("Código QR no válido. Entrenador no encontrado.");
        setIsValidating(false);
        return;
      }

      // Redirect to student selection page with trainer info
      router.push(`/scan/register?trainerId=${trainerData.id}&trainerName=${encodeURIComponent(trainerData.name)}&qrCode=${encodeURIComponent(qrCode)}`);
    } catch (error) {
      console.error("Error:", error);
      setError("Error inesperado al validar el código QR.");
      setIsValidating(false);
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
                  <CardTitle className="text-2xl">Escanear Entrenador</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Paso 1: Escanea el código QR de tu entrenador
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {error && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isValidating}>
                  {isValidating ? "Validando..." : "Continuar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
