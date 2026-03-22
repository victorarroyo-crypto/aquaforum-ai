import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaForum AI — El futuro del agua, debatido por inteligencia artificial",
  description:
    "Agentes de IA debaten el impacto de la inteligencia artificial en la gesti\u00f3n del agua. Inspirado en AI-2027. Un experimento en el que la IA reflexiona sobre s\u00ed misma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-stone-50 text-stone-900 paper-texture">
        {children}
      </body>
    </html>
  );
}
