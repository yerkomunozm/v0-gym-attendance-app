"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';

export function SuccessClient() {
  const handleClose = () => {
    // Try to close the window/tab
    window.close();
    
    // If window.close() doesn't work (it only works for windows opened by JavaScript),
    // show a message to the user
    setTimeout(() => {
      const message = document.getElementById("close-message");
      if (message) {
        message.classList.remove("hidden");
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            ¡Asistencia Registrada!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-slate-600">
            Tu asistencia ha sido registrada exitosamente.
          </p>
          
          <Button 
            onClick={handleClose} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Cerrar
          </Button>
          
          <p id="close-message" className="hidden text-center text-xs text-slate-500 mt-2">
            Puedes cerrar esta pestaña manualmente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
