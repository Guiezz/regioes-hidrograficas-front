"use client";

import { ReservoirSelector } from "@/components/layout/ReservoirSelector";
import { MapPin, Info, Compass } from "lucide-react";

interface SelectRegionPromptProps {
  moduleName: string;
  description?: string;
}

export function SelectRegionPrompt({
  moduleName,
  description = "A visualização dos indicadores, mapas e planos analíticos requer a escolha de uma região hidrográfica.",
}: SelectRegionPromptProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl mx-auto space-y-6 flex flex-col items-center">
        {/* Ícone indicativo de navegação / seleção de região */}
        <div className="h-16 w-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#005384] shadow-xs">
          <Compass className="h-8 w-8 text-[#005384]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#005384]/10 text-[#005384] border border-[#005384]/20">
            <MapPin className="h-3.5 w-3.5 text-[#005384]" />
            <span>Módulo: {moduleName}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#005384]">
            Nenhuma Região Selecionada
          </h2>

          <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-[#005384] bg-sky-50 px-4 py-2.5 rounded-lg border border-sky-200/80 max-w-md mx-auto">
            <Info className="h-4 w-4 text-[#0094e0] shrink-0" />
            <p className="leading-snug text-left">
              Por favor, selecione uma região no topo da página para visualizar os dados de{" "}
              <strong className="font-semibold">{moduleName}</strong>.
            </p>
          </div>
        </div>

        {/* Seletor direto no corpo da página */}
        <div className="w-full max-w-sm pt-2 space-y-2">
          <span className="text-xs text-muted-foreground block font-medium">
            Ou escolha uma região hidrográfica abaixo:
          </span>
          <ReservoirSelector fullWidth />
        </div>
      </div>
    </div>
  );
}
