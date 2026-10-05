"use client";

import { Menu } from "lucide-react";
// 1. Adicione o SheetTitle e SheetHeader (opcional, mas boa prática) nas importações
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 bg-[#07182d] border-none w-72">
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>

        <Sidebar isMobile={true} />
      </SheetContent>
    </Sheet>
  );
}
