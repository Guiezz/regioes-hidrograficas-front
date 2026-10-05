import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/main-layout";
import { ReservoirProvider } from "@/context/ReservoirContext"; // [1] Importar o Provider
import { Suspense } from "react"; // [2] Importar Suspense

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIGRH — Sistema de Informações de Gestão das Regiões Hidrográficas do Ceará",
  description:
    "Sistema de Informações de Gestão das Regiões Hidrográficas do Ceará",
  icons: {
    icon: "/logos/logo-isolada.svg",
    shortcut: "/logos/logo-isolada.svg",
    apple: "/logos/logo-isolada.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Envolvemos a aplicação no Provider para que o contexto funcione em todas as páginas */}
        <Suspense fallback={<div className="p-4">Carregando recursos...</div>}>
          <ReservoirProvider>
            <MainLayout>{children}</MainLayout>
          </ReservoirProvider>
        </Suspense>
      </body>
    </html>
  );
}
