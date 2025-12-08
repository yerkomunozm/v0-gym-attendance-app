import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from '@/lib/contexts/auth-context';
import { BranchProvider } from '@/lib/contexts/branch-context';
import { BranchAutoSetter } from '@/components/branch-auto-setter';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Control de Asistencias - Gimnasio",
  description: "Sistema de gestión de asistencias para gimnasios con códigos QR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <BranchProvider>
            <BranchAutoSetter />
            {children}
          </BranchProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
