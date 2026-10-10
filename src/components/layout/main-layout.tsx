"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileSidebar = dynamic(
  () => import("@/components/layout/mobile-sidebar"),
  {
    ssr: false,
  },
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen relative flex bg-gray-50 overflow-hidden">
      {/* --- SIDEBAR DESKTOP (Fixa) --- */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-80 bg-[#07182d] transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-72" : "w-20",
        )}
      >
        <Sidebar collapsed={!isSidebarOpen} />
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main
        className={cn(
          "flex flex-col flex-1 min-w-0 h-full transition-all duration-300 ease-in-out",
          isSidebarOpen ? "md:pl-72" : "md:pl-20",
        )}
      >
        <div className="border-b h-16 flex items-center px-4 bg-white shadow-sm gap-4">
          {/* Mobile (Hambúrguer) */}
          <MobileSidebar />

          {/* Botão Desktop (Toggle) */}
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="ghost"
            size="icon"
            className="hidden md:flex text-muted-foreground hover:bg-slate-100"
            title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>

          {/* Header / Select */}
          <div className="flex-1 min-w-0">
            <Header />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
