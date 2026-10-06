"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReservoir } from "@/context/ReservoirContext";

interface ReservoirSelectorProps {
  fullWidth?: boolean;
}

export function ReservoirSelector({ fullWidth = false }: ReservoirSelectorProps) {
  const { reservoirs, selectedReservoir, setSelectedReservoir, isLoading } =
    useReservoir();

  if (isLoading) {
    return (
      <div
        className={
          fullWidth
            ? "w-full h-11 bg-muted animate-pulse rounded-md"
            : "w-full h-10 bg-muted animate-pulse rounded-md"
        }
      />
    );
  }

  return (
    <Select
      value={selectedReservoir ? selectedReservoir.id.toString() : ""}
      onValueChange={(value) => {
        const reservoir = reservoirs.find((r) => r.id.toString() === value);
        if (reservoir) {
          setSelectedReservoir(reservoir);
        }
      }}
    >
      <SelectTrigger
        className={
          fullWidth
            ? `w-full h-11 text-base bg-background/80 backdrop-blur-sm transition-all ${
                !selectedReservoir
                  ? "border-[#005384] ring-2 ring-[#0094e0]/20 shadow-xs text-slate-700 font-medium"
                  : "border-primary/20 text-slate-900 font-semibold"
              }`
            : `w-full h-10 bg-background/50 backdrop-blur-sm transition-all ${
                !selectedReservoir
                  ? "border-[#005384] ring-2 ring-[#0094e0]/20 text-slate-600 font-medium"
                  : "border-primary/20 text-slate-900 font-semibold"
              }`
        }
      >
        <SelectValue
          placeholder={
            fullWidth
              ? "Selecione uma região hidrográfica..."
              : "Selecione uma região..."
          }
        />
      </SelectTrigger>
      <SelectContent>
        {reservoirs.map((reservoir) => (
          <SelectItem key={reservoir.id} value={reservoir.id.toString()}>
            {reservoir.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
